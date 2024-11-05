import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../auth/utils.mjs';
import { createTodoAction } from '../../businessLogic/todos.js';

const createTodoHandler = async (event) => {
  try {
    const userId = getUserId(event);

    const newTodo = JSON.parse(event.body);

    const todo = await createTodoAction(userId, newTodo);

    return {
      statusCode: 201, // Created
      body: JSON.stringify({
        item: todo
      }),
    };
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error creating todo:', error);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({
        message: 'Error creating the todo item.',
      }),
    };
  }
};

export const handler = middy(createTodoHandler)
  .use(httpErrorHandler()) // Use default error handler for middleware
  .use(
    cors({
      credentials: true, // Enable credentials (cookies, HTTP headers)
    })
  );
