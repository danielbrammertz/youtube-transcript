const express = require('express');
const { YoutubeTranscript } = require('../../dist/youtube-transcript.common.js');
const router = express.Router();

/**
 * @swagger
 * /api/transcript/{videoId}:
 *   get:
 *     summary: Fetch transcript for a YouTube video
 *     description: Retrieves the transcript for a given YouTube video ID or URL
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         description: YouTube video ID or URL
 *         schema:
 *           type: string
 *       - name: lang
 *         in: query
 *         required: false
 *         description: Language code (ISO) for the transcript
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transcript retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   text:
 *                     type: string
 *                     description: Transcript text segment
 *                   duration:
 *                     type: number
 *                     description: Duration of the segment in seconds
 *                   offset:
 *                     type: number
 *                     description: Start time of the segment in seconds
 *                   lang:
 *                     type: string
 *                     description: Language code of the transcript
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Transcript not found or disabled
 *       500:
 *         description: Server error
 */
router.get('/transcript/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { lang } = req.query;
    
    // Get proxy from environment variables if set
    const proxyUrl = process.env.PROXY_URL || null;
    
    // Configuration object
    const config = {
      ...(lang && { lang }),
      ...(proxyUrl && { proxy: proxyUrl })
    };
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, config);
    
    res.json({
      success: true,
      videoId,
      transcript,
      segments: transcript.length
    });
  } catch (error) {
    const statusCode = error.message.includes('No transcripts are available') || 
                      error.message.includes('Transcript is disabled') ? 404 : 
                      error.message.includes('Impossible to retrieve Youtube video ID') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message,
      videoId: req.params.videoId
    });
  }
});

module.exports = router; 