"use client";
import { createPortal } from "react-dom";

export default function ModalPortal({ children }) {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
}