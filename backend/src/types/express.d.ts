declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: number;
      };
    }
  }
}

export {};
