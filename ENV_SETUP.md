# Environment Variables Setup

## Required Environment Variables

The chat API requires the following environment variables to be configured:

### `MODEL_API_URL`
- **Description**: The base URL endpoint for your AI model API
- **Example**: `https://api.example.com/v1/chat`
- **Required**: Yes (for production)

### `MODEL_API_KEY`
- **Description**: API key for authenticating with the model API
- **Example**: `sk-1234567890abcdef`
- **Required**: No (dev mode will use canned responses if missing)

## Setup Instructions

### Option 1: Using Expo Config (Recommended)

Add environment variables to your `app.json` or create an `app.config.js`:

**app.config.js** (create this file in the root):
```javascript
export default {
  expo: {
    // ... your existing config
    extra: {
      MODEL_API_URL: process.env.MODEL_API_URL,
      MODEL_API_KEY: process.env.MODEL_API_KEY,
    },
  },
};
```

Then create a `.env` file in the root directory:
```
MODEL_API_URL=https://api.example.com/v1/chat
MODEL_API_KEY=your-api-key-here
```

### Option 2: Using process.env directly

The code will also check `process.env.MODEL_API_URL` and `process.env.MODEL_API_KEY` as fallbacks.

### Option 3: Hardcode for Development (Not Recommended)

You can temporarily hardcode values in `api/chat.ts`, but this is not recommended for production.

## Development Mode

If `MODEL_API_KEY` is not set, the app will automatically run in **dev mode**:
- Returns canned responses based on simple pattern matching
- Logs a warning to the console
- Allows you to test the UI without API access
- Perfect for development and testing

## Example API Request Format

The API wrapper sends requests in this format:

```json
{
  "system_prompt": "You are Ally, a mental health support assistant...",
  "conversation": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    {
      "role": "assistant",
      "content": "Hello! I'm doing well, thank you."
    }
  ],
  "memory": "Optional memory/context string"
}
```

## Expected API Response Format

Your API should return responses in this format:

```json
{
  "message": "The AI's response text here"
}
```

Or with error handling:

```json
{
  "error": "Error message if something went wrong"
}
```

## Security Notes

1. **Never commit API keys to version control**
   - Add `.env` to your `.gitignore`
   - Use environment variables or secure storage

2. **Use different keys for development and production**
   - Development: Can use dev mode (no key needed)
   - Production: Must have valid API key

3. **API Key Storage**
   - For production apps, consider using Expo SecureStore or similar
   - Never hardcode keys in source code

## Testing

1. **Test without API key** (Dev mode):
   - Don't set `MODEL_API_KEY`
   - App will use canned responses
   - Good for UI testing

2. **Test with API key**:
   - Set both `MODEL_API_URL` and `MODEL_API_KEY`
   - App will make real API calls
   - Monitor network requests in dev tools

## Troubleshooting

### "MODEL_API_URL is not configured"
- Make sure you've set the environment variable
- Check that `app.config.js` is properly configured
- Restart Expo after changing environment variables

### API requests failing
- Check that your API URL is correct
- Verify your API key is valid
- Check network connectivity
- Review API response format matches expected structure

### Dev mode not working
- Ensure `MODEL_API_KEY` is not set (or is empty)
- Check console for dev mode warning message
- Verify the function is being called correctly

