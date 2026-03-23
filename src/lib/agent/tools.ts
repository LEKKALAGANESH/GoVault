// Tool definitions for the GoVault AI Agent

import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const agentTools: ChatCompletionTool[] = [
  // ============ Document Parsing Tools ============
  {
    type: "function",
    function: {
      name: "parse_flight",
      description: "Extract flight booking details from a document (boarding pass, confirmation email, etc.)",
      parameters: {
        type: "object",
        properties: {
          airline: {
            type: "string",
            description: "Airline name (e.g., 'Thai Airways', 'Singapore Airlines')",
          },
          flight_number: {
            type: "string",
            description: "Flight number (e.g., 'TG315', 'SQ123')",
          },
          departure_airport: {
            type: "string",
            description: "Departure airport code (e.g., 'BKK', 'SIN')",
          },
          arrival_airport: {
            type: "string",
            description: "Arrival airport code (e.g., 'HKT', 'DEL')",
          },
          departure_time: {
            type: "string",
            description: "Departure date and time in ISO format (e.g., '2026-02-15T10:30:00')",
          },
          arrival_time: {
            type: "string",
            description: "Arrival date and time in ISO format",
          },
          confirmation_number: {
            type: "string",
            description: "Booking confirmation/PNR number",
          },
          seats: {
            type: "string",
            description: "Seat assignments (e.g., '12A, 12B')",
          },
        },
        required: ["airline", "flight_number", "departure_airport", "arrival_airport"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "parse_hotel",
      description: "Extract hotel booking details from a document (confirmation email, voucher, etc.)",
      parameters: {
        type: "object",
        properties: {
          hotel_name: {
            type: "string",
            description: "Name of the hotel",
          },
          address: {
            type: "string",
            description: "Hotel address",
          },
          check_in: {
            type: "string",
            description: "Check-in date in ISO format (e.g., '2026-02-15')",
          },
          check_out: {
            type: "string",
            description: "Check-out date in ISO format",
          },
          room_type: {
            type: "string",
            description: "Room type (e.g., 'Deluxe Ocean View', 'Standard Double')",
          },
          confirmation_number: {
            type: "string",
            description: "Booking confirmation number",
          },
        },
        required: ["hotel_name", "check_in", "check_out"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "parse_activity",
      description: "Extract activity/tour/experience booking details from a document (safari tickets, tour vouchers, attraction tickets, etc.)",
      parameters: {
        type: "object",
        properties: {
          activity_name: {
            type: "string",
            description: "Name of the activity, tour, or experience",
          },
          provider: {
            type: "string",
            description: "Company/operator providing the activity",
          },
          location: {
            type: "string",
            description: "Location where the activity takes place",
          },
          date: {
            type: "string",
            description: "Date of the activity in ISO format (e.g., '2026-02-15')",
          },
          time: {
            type: "string",
            description: "Start time of the activity (e.g., '09:00')",
          },
          duration: {
            type: "string",
            description: "Duration of the activity (e.g., '3 hours', 'Full day')",
          },
          confirmation_number: {
            type: "string",
            description: "Booking confirmation number",
          },
          num_participants: {
            type: "integer",
            description: "Number of participants/tickets",
          },
          notes: {
            type: "string",
            description: "Important notes, meeting point, what to bring, etc.",
          },
        },
        required: ["activity_name", "date"],
      },
    },
  },

  // ============ Itinerary Parsing Tool ============
  {
    type: "function",
    function: {
      name: "parse_itinerary_text",
      description: "Parse unstructured itinerary text into structured days and activities",
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "array",
            description: "Array of itinerary days",
            items: {
              type: "object",
              properties: {
                day_number: { type: "integer", description: "Day number (1, 2, 3...)" },
                date: { type: "string", description: "Date in ISO format if mentioned" },
                title: { type: "string", description: "Title for the day (e.g., 'Arrival Day', 'Beach Day')" },
                location: { type: "string", description: "Main location for the day" },
                summary: { type: "string", description: "Brief summary of the day" },
                activities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string", description: "Time (e.g., '09:00', 'Morning')" },
                      title: { type: "string", description: "Activity title" },
                      description: { type: "string", description: "Activity description" },
                      location: { type: "string", description: "Activity location" },
                      tips: { type: "string", description: "Tips for this activity (what to bring, booking info, best times, etc.)" },
                      tags: { type: "array", items: { type: "string" }, description: "Tags like 'Choice' (for either/or options), 'Needs Booking' (requires advance tickets)" },
                    },
                    required: ["title"],
                  },
                },
              },
              required: ["day_number", "title", "activities"],
            },
          },
        },
        required: ["days"],
      },
    },
  },

  // ============ Day Management Tools ============
  {
    type: "function",
    function: {
      name: "add_day",
      description: "Add a new day to the itinerary",
      parameters: {
        type: "object",
        properties: {
          day_number: { type: "integer", description: "Day number" },
          date: { type: "string", description: "Date in ISO format" },
          title: { type: "string", description: "Title for the day" },
          location: { type: "string", description: "Main location" },
          summary: { type: "string", description: "Day summary" },
        },
        required: ["day_number", "date", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_day",
      description: "Update an existing day in the itinerary",
      parameters: {
        type: "object",
        properties: {
          day_id: { type: "string", description: "ID of the day to update" },
          date: { type: "string", description: "New date in ISO format (YYYY-MM-DD)" },
          title: { type: "string", description: "New title" },
          location: { type: "string", description: "New location" },
          summary: { type: "string", description: "New summary" },
          energy_level: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], description: "Energy level for the day" },
        },
        required: ["day_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_day",
      description: "Delete a day from the itinerary",
      parameters: {
        type: "object",
        properties: {
          day_id: { type: "string", description: "ID of the day to delete" },
        },
        required: ["day_id"],
      },
    },
  },

  // ============ Activity Management Tools ============
  {
    type: "function",
    function: {
      name: "add_activity",
      description: "Add a new activity to a specific day",
      parameters: {
        type: "object",
        properties: {
          day_number: { type: "integer", description: "Day number to add the activity to" },
          time: { type: "string", description: "Start time (e.g., '09:00', '14:30')" },
          end_time: { type: "string", description: "End time" },
          title: { type: "string", description: "Activity title" },
          description: { type: "string", description: "Activity description" },
          location: { type: "string", description: "Activity location" },
          location_url: { type: "string", description: "Google Maps or location URL" },
          tips: { type: "string", description: "Tips for this activity" },
          tags: { type: "array", items: { type: "string" }, description: "Tags (e.g., 'Kid-Friendly', 'Vegetarian')" },
        },
        required: ["day_number", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_activity",
      description: "Update an existing activity",
      parameters: {
        type: "object",
        properties: {
          activity_id: { type: "string", description: "ID of the activity to update" },
          time: { type: "string", description: "New start time" },
          end_time: { type: "string", description: "New end time" },
          title: { type: "string", description: "New title" },
          description: { type: "string", description: "New description" },
          location: { type: "string", description: "New location" },
          location_url: { type: "string", description: "New location URL" },
          tips: { type: "string", description: "New tips" },
          tags: { type: "array", items: { type: "string" }, description: "New tags" },
        },
        required: ["activity_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_activity",
      description: "Delete an activity from the itinerary",
      parameters: {
        type: "object",
        properties: {
          activity_id: { type: "string", description: "ID of the activity to delete" },
        },
        required: ["activity_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "move_activity",
      description: "Move an activity to a different day",
      parameters: {
        type: "object",
        properties: {
          activity_id: { type: "string", description: "ID of the activity to move" },
          to_day_number: { type: "integer", description: "Day number to move the activity to" },
          new_order: { type: "integer", description: "New order position within the day" },
        },
        required: ["activity_id", "to_day_number"],
      },
    },
  },

  // ============ Booking Management Tools ============
  {
    type: "function",
    function: {
      name: "delete_booking",
      description: "Delete a booking (flight or hotel) from the trip",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "ID of the booking to delete" },
        },
        required: ["booking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_all_bookings",
      description: "Delete all bookings of a specific type (FLIGHT, HOTEL, or all) from the trip",
      parameters: {
        type: "object",
        properties: {
          booking_type: { type: "string", enum: ["FLIGHT", "HOTEL", "ALL"], description: "Type of bookings to delete, or ALL for all bookings" },
        },
        required: ["booking_type"],
      },
    },
  },

  // ============ Todo Management Tools ============
  {
    type: "function",
    function: {
      name: "delete_todo",
      description: "Delete a todo item from the trip",
      parameters: {
        type: "object",
        properties: {
          todo_id: { type: "string", description: "ID of the todo to delete" },
        },
        required: ["todo_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_all_todos",
      description: "Delete all todos or todos in a specific category from the trip",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Category of todos to delete (e.g., 'bookings', 'packing'). If not specified, deletes all todos." },
        },
        required: [],
      },
    },
  },

  // ============ Packing List Management Tools ============
  {
    type: "function",
    function: {
      name: "delete_all_packing",
      description: "Delete all packing items from the trip's packing checklist",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },

  // ============ Phrases Management Tools ============
  {
    type: "function",
    function: {
      name: "delete_all_phrases",
      description: "Delete all local language phrases from the trip",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },

  // ============ Trip Metadata Tools ============
  {
    type: "function",
    function: {
      name: "update_trip_dates",
      description: "Update the trip's start date and/or end date. Use this when the user wants to change when the trip begins or ends. This will automatically recalculate all itinerary day dates.",
      parameters: {
        type: "object",
        properties: {
          start_date: { type: "string", description: "New trip start date in YYYY-MM-DD format" },
          end_date: { type: "string", description: "New trip end date in YYYY-MM-DD format" },
        },
        required: [],
      },
    },
  },

  // ============ Content Generation Tools ============
  {
    type: "function",
    function: {
      name: "generate_packing_list",
      description: "Generate a destination-specific packing checklist",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Packing items grouped by category",
            items: {
              type: "object",
              properties: {
                category: { type: "string", description: "Category (e.g., 'Clothing', 'Electronics', 'Toiletries', 'Documents', 'Health', 'Miscellaneous')" },
                item: { type: "string", description: "Item name" },
              },
              required: ["category", "item"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_phrases",
      description: "Generate essential local language phrases for travelers",
      parameters: {
        type: "object",
        properties: {
          phrases: {
            type: "array",
            description: "Array of useful phrases",
            items: {
              type: "object",
              properties: {
                english: { type: "string", description: "English phrase" },
                local_text: { type: "string", description: "Phrase in local language/script" },
                pronunciation: { type: "string", description: "Phonetic pronunciation guide" },
              },
              required: ["english", "local_text"],
            },
          },
        },
        required: ["phrases"],
      },
    },
  },
];

// Helper to get function name from a tool
function getToolFunctionName(tool: ChatCompletionTool): string | null {
  if (tool.type === "function") {
    return tool.function.name;
  }
  return null;
}

// Get tools based on action type
import type { AgentActionType } from "./types";

export function getToolsForAction(action: AgentActionType): ChatCompletionTool[] | undefined {
  switch (action) {
    case "PARSE_DOCUMENT":
      return agentTools.filter((t) => {
        const name = getToolFunctionName(t);
        return name && ["parse_flight", "parse_hotel", "parse_activity"].includes(name);
      });
    case "PARSE_ITINERARY":
      // Include packing and phrases tools so comprehensive itineraries can be fully parsed
      return agentTools.filter((t) => {
        const name = getToolFunctionName(t);
        return name && ["parse_itinerary_text", "generate_packing_list", "generate_phrases"].includes(name);
      });
    case "EDIT_ITINERARY":
      return agentTools.filter((t) => {
        const name = getToolFunctionName(t);
        return name && [
          "add_day",
          "update_day",
          "delete_day",
          "add_activity",
          "update_activity",
          "delete_activity",
          "move_activity",
          "update_trip_dates",
          "delete_booking",
          "delete_all_bookings",
          "delete_todo",
          "delete_all_todos",
          "delete_all_packing",
          "delete_all_phrases",
        ].includes(name);
      });
    case "GENERATE_PACKING":
      return agentTools.filter((t) => getToolFunctionName(t) === "generate_packing_list");
    case "GENERATE_PHRASES":
      return agentTools.filter((t) => getToolFunctionName(t) === "generate_phrases");
    case "GENERATE_ITINERARY_PROMPT":
    case "CAPTURE_TRIP_INFO":
      // These actions don't use tools - they return data directly
      return undefined;
    default:
      return agentTools;
  }
}
