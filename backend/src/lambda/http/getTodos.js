import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getTodosAction } from '../../businessLogic/todos.js';
import { getUserId } from '../auth/utils.mjs';

const getTodosHandler = async (event) => {
  try {
    // Retrieve the user ID from the event (authentication)
    const userId = getUserId(event);

    // Get the todos for the user
    const items = await getTodosAction(userId);

    // Log the items (optional, for debugging)
    console.log('Retrieved todos:', items);

    // Return a successful response with the todos
    return {
      statusCode: 200, // OK
      body: JSON.stringify({
        items,
      }),
    };
  } catch (error) {
    // Handle any errors that occur during fetching todos
    console.error('Error retrieving todos:', error);

    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({
        message: 'Error retrieving todos.',
      }),
    };
  }
};

// Attach middleware to the handler
export const handler = middy(getTodosHandler)
  .use(httpErrorHandler()) // Default error handler for middleware
  .use(
    cors({
      credentials: true, // Enable credentials (cookies, HTTP headers)
    })
  );
