import express from "express";
import {
    searchHotelsAndRooms,
    searchAvailableRooms,
    suggestAlternativeDates,
} from "../controllers/searchControllers.js";

const searchRouter = express.Router();

// Autocomplete search
searchRouter.get("/autocomplete", searchHotelsAndRooms);

// Advanced search with date filtering
searchRouter.get("/rooms", searchAvailableRooms);

// Suggest alternative dates
searchRouter.get("/suggest-dates", suggestAlternativeDates);

export default searchRouter;
