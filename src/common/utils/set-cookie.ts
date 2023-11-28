import { Response } from 'express';

export const setCookie = (response: Response, refreshToken: string) => {
  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // secure: true, => if you use https
  });
};
