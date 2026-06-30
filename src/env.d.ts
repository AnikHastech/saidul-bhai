/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Buyer's market country (ISO-2), set by middleware from the cookie. */
    country: string;
  }
}
