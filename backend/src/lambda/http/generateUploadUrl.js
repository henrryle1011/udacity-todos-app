import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../auth/utils.mjs';
import { generateImageUrlAction } from '../../businessLogic/todos.js';

const generateImageUrlHandler = async (event) => {
  try {
    // Retrieve the user ID from the event (authentication)
    const userId = getUserId(event);

    // Extract the todo ID from the path parameters
    const { todoId } = event.pathParameters;

    // Call the business logic to generate the image upload URL
    const uploadUrl = await generateImageUrlAction(userId, todoId);

    // Return the generated upload URL in the response
    return {
      statusCode: 200, // OK
      body: JSON.stringify({
        uploadUrl,
      }),
    };
  } catch (error) {
    // Handle any errors during the image URL generation process
    console.error('Error generating image URL:', error);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({
        message: 'Error generating image upload URL.',
      }),
    };
  }
};

// Attach middleware to the handler
export const handler = middy(generateImageUrlHandler)
  .use(httpErrorHandler()) // Default error handler for middleware
  .use(
    cors({
      credentials: true, // Enable credentials (cookies, HTTP headers)
    })
  );
