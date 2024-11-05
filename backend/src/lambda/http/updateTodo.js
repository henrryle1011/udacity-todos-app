import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../auth/utils.mjs';
import { updateTodoAction } from '../../businessLogic/todos.js';

const updateTodoHandler = async (event) => {
  try {
    // Retrieve the user ID from the event (authentication)
    const userId = getUserId(event);

    // Extract the todo ID from the path parameters
    const { todoId } = event.pathParameters;

    // Parse the request body to get the updated todo data
    const updatedTodo = JSON.parse(event.body);

    // Call the business logic to update the todo item
    await updateTodoAction(userId, todoId, updatedTodo);

    // Return a success response (status 200 OK)
    return {
      statusCode: 200, // OK
      body: JSON.stringify({
        message: 'Todo updated successfully',
      }),
    };
  } catch (error) {
    // Handle any errors that occur during the update process
    console.error('Error updating todo:', error);

    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({
        message: 'Error updating the todo item.',
      }),
    };
  }
};

// Attach middleware to the handler
export const handler = middy(updateTodoHandler)
  .use(httpErrorHandler()) // Default error handler for middleware
  .use(
    cors({
      credentials: true, // Enable credentials (cookies, HTTP headers)
    })
  );
