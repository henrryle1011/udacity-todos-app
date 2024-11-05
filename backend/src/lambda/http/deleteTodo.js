import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../auth/utils.mjs';
import { deleteTodoAction } from '../../businessLogic/todos.js';

// The main handler function
const deleteTodoHandler = async (event) => {
  try {

    const userId = getUserId(event);

    const { todoId } = event.pathParameters;

    await deleteTodoAction(userId, todoId);

    return {
      statusCode: 204, // No Content
      body: JSON.stringify({}),
    };
  } catch (error) {
    
    console.error('Error deleting todo:', error);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({
        message: 'Error deleting the todo item.',
      }),
    };
  }
};

// Attach middleware to the handler
export const handler = middy(deleteTodoHandler)
  .use(httpErrorHandler()) // Default error handler for middleware
  .use(
    cors({
      credentials: true, // Enable credentials (cookies, HTTP headers)
    })
  );
