import * as request from 'supertest';
import { Test } from 'supertest';
import { INestApplication } from '@nestjs/common';

//UserRequests
export const getUsersRequest = (app: INestApplication): Test =>
  request(app.getHttpServer()).get('/users');
export const createUserRequest = (app: INestApplication): Test =>
  request(app.getHttpServer()).post('/users');
export const deleteUserRequest = (
  app: INestApplication,
  userId: string,
): Test => request(app.getHttpServer()).delete(`/users/${userId}`);

//Blogs requests
export const getBlogsRequest = (app: INestApplication): Test =>
  request(app.getHttpServer()).get('/blogs');
export const getBlogRequest = (app: INestApplication, id: string): Test =>
  request(app.getHttpServer()).get(`/blogs/${id}`);
export const createBlogsRequest = (app: INestApplication): Test =>
  request(app.getHttpServer()).post('/blogs');
export const deleteBlogRequest = (app: INestApplication, id: string): Test =>
  request(app.getHttpServer()).delete(`/blogs/${id}`);
export const updateBlogRequest = (app: INestApplication, id: string): Test =>
  request(app.getHttpServer()).put(`/blogs/${id}`);
export const createPostByBlogIdRequest = (
  app: INestApplication,
  blogId: string,
): Test => {
  return request(app.getHttpServer()).post(`/blogs/${blogId}/posts`);
};
export const getPostsByBlogIdRequest = (
  app: INestApplication,
  blogId: string,
): Test => {
  return request(app.getHttpServer()).get(`/blogs/${blogId}/posts`);
};

//Posts requests
export const getPostsRequest = (app: INestApplication): Test =>
  request(app.getHttpServer()).get('/posts');
export const getPostRequest = (app: INestApplication, id: string): Test =>
  request(app.getHttpServer()).get(`/posts/${id}`);
export const createPostRequest = (app: INestApplication): Test =>
  request(app.getHttpServer()).post('/posts');
export const deletePostRequest = (app: INestApplication, id: string): Test =>
  request(app.getHttpServer()).delete(`/posts/${id}`);
export const updatePostRequest = (app: INestApplication, id: string): Test =>
  request(app.getHttpServer()).put(`/posts/${id}`);

//Comments requests
export const getCommentsByPostIdRequest = (
  app: INestApplication,
  postId: string,
): Test => request(app.getHttpServer()).get(`/post/${postId}/comments`);