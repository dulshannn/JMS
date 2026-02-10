import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Design from "../models/Design.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // Go up one level to server root

// @desc    Generate AI Design
// @route   POST /api/designs/generate
export const generateDesign = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Check Limits
    if (user.plan === 'free' && user.generationCount >= 5) {
      return res.status(403).json({ success: false, error: "Limit reached" });
    }

    const { designPrompt, designType, customizations } = req.body;
    const promptStr = String(designPrompt || "").trim();
    const seed = Math.floor(Math.random() * 100000);
    let buffer;

    // Image Generation Logic (Stability AI)
    try {
        const apiKey = process.env.STABILITY_API_KEY || "sk-FB220SwwWSsSK1jqnS4iF91akSj4JiYoPCvqNllZ5FyB6ehI";
        if (!apiKey) {
            throw new Error("Stability AI API key not found");
        }

        console.log("Using Stability AI for image generation...");
        
        // Try using the older but more stable endpoint
        const stabilityUrl = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
        
        const requestBody = {
            text_prompts: [
                {
                    text: `${designType} ${promptStr}`.trim(),
                    weight: 1
                }
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
            seed: seed
        };
        
        console.log("Request body:", JSON.stringify(requestBody, null, 2));
        
        const response = await axios.post(stabilityUrl, requestBody, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log("Stability AI response status:", response.status);
        console.log("Response data keys:", Object.keys(response.data || {}));

        // Get the first image artifact
        const artifacts = response.data.artifacts;
        if (!artifacts || artifacts.length === 0) {
            throw new Error("No artifacts received from Stability AI");
        }
        
        const artifact = artifacts[0];
        if (artifact && artifact.base64) {
            buffer = Buffer.from(artifact.base64, 'base64');
            console.log("Successfully created buffer from Stability AI");
        } else {
            throw new Error("No base64 data in artifact");
        }
    } catch (stableError) {
        console.log("Stability AI failed, trying fallback:", stableError.message);
        console.log("Error details:", stableError.response?.data || stableError.message);
        
        // Fallback to Pollinations AI (Free)
        try {
            const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(designType + " " + promptStr)}?width=768&height=768&model=turbo&seed=${seed}&nologo=true`;
            const pollRes = await axios.get(pollUrl, { responseType: 'arraybuffer' });
            buffer = Buffer.from(pollRes.data);
            console.log("Successfully used Pollinations fallback");
        } catch (pollError) {
            console.error("Both AI services failed:", pollError.message);
            throw new Error("All AI image generation services are currently unavailable");
        }
    }

    // Save Image
    const filename = `design_${Date.now()}_${seed}.png`;
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    // Update User Count
    await User.findByIdAndUpdate(userId, { $inc: { generationCount: 1 } });

    // Save Design to DB
    const lkrPrice = Math.floor(Math.random() * (450000 - 85000 + 1)) + 85000;
    const designData = {
      title: promptStr.substring(0, 40) || "Custom Design",
      prompt: promptStr,
      type: designType,
      imageUrl: `/uploads/${filename}`,
      customizations: { ...customizations, estimatedCost: lkrPrice },
      user: userId
    };

    const savedDesign = await Design.create(designData);
    res.status(200).json({ success: true, data: savedDesign, remainingCredits: 5 - (user.generationCount + 1) });

  } catch (error) {
    console.error("Design Generation Error:", error);
    res.status(500).json({ success: false, error: "Generation Failed" });
  }
};

// @desc    Get Design History
// @route   GET /api/designs/history
export const getHistory = async (req, res) => {
  try {
    const history = await Design.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ success: true, data: history });
  } catch (e) {
    res.status(500).json({ success: false, error: "History Error" });
  }
};