// utils/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export const authenticate = (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Authentication token is missing" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
};
