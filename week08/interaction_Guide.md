Got it! Below is a simulated interaction between a user (student) and the chatbot, following the system prompt's rules for Tasks 1 to 5. The user starts with "let's learn" and switches tasks by saying "task 2", "task 3", etc. The chatbot adheres to task-specific requirements. I'll skip displaying the map HTML, focus on step-by-step guidance, correction tables, and appropriate tool usage for Tasks 1-4, with Task 5 handling a user-uploaded map. Locations are chosen to meet task requirements (same street for Tasks 1-2, different streets for Tasks 3-4, custom map for Task 5).

VALID_LOCATIONS = {
    "Post Office",
    "Train Station",
    "Book Shop",
    "Hospital",
    "Church",
    "Police Station",
    "Sports Centre",
    "Bank",
    "Fire Station",
    "Supermarket",
    "Bakery",
    "Clinic",
}

---

**User**: let's learn

**Chatbot**: Hello! I am your guide to giving directions. Let me show you the map first.

*Displays map (HTML not shown)*

Now, how can you go from the Post Office to the Hospital? Please try using lowercase words and short sentences.

**User**: exit post office. walk past book shop. hospital on right.

**Chatbot**: Awesome start! Let's check your directions.

*Calling reading_the_map_adv_3 tool with startLocation="Post Office" and endLocation="Hospital".*

*Tool output (not shown to user): Exit the Post Office. Walk west from W5 to W3. The Hospital is on your right.*

| Original | Revised |
|----------|---------|
| exit post office | **E**xit the Post Office. |
| walk past book shop | **W**alk past the Book Shop. |
| hospital on right | The Hospital is on **your right**. |

Please review the feedback. Do you accept the revisions? What is your next step?

**User**: Yes, I accept. task 2

**Chatbot**: Super! Let us start Task 2. How can you go from the Book Shop to the Police Station? Write short sentences with the prepositional phrases you learned.

**User**: Exit the Book Shop. Walk past the Hospital. The Police Station is on your right.

**Chatbot**: Great effort! Let’s check your sentences.

*Calling reading_the_map_adv_3 tool with startLocation="Book Shop" and endLocation="Police Station".*

*Tool output (not shown to user): Exit the Book Shop. Walk east from W4 to W1. The Police Station is on your right.*

| Original | Revised |
|----------|---------|
| Exit the Book Shop. | Exit the Book Shop. |
| Walk past the Hospital. | Walk past the Hospital. |
| The Police Station is on your right. | The Police Station is on **your right**. |

Well done! Please review the feedback. Do you accept the revisions? Want to try another pair or move to another task?

**User**: Task 3

**Chatbot**: Fantastic! Let us start Task 3. How can you go from the Clinic to the Bank? Write more than one sentence and use linking words.

**User**: Exit the Clinic. Turn right into East Street. Walk past the Bakery. Turn left into North Street. The Bank is on your right.

**Chatbot**: Wow, you’re doing great! Let’s check your directions.

*Calling reading_the_map_adv_3 tool with startLocation="Clinic" and endLocation="Bank".*

*Tool output (not shown to user): Exit the Clinic. Turn right into East Street. Walk west from E3 to E1. Turn left into North Street. Walk north to N2. The Bank is on your right.*

| Original | Revised |
|----------|---------|
| Exit the Clinic. | **First**, exit the Clinic. |
| Turn right into East Street. | **Then**, turn right into East Street. |
| Walk past the Bakery. | **After that**, walk past the Bakery. |
| Turn left into North Street. | **Then**, turn left into North Street. |
| The Bank is on your right. | **Finally**, the Bank is on **your right**. |

Please review the feedback. Do you accept the revisions? Want to continue or try another task?

**User**: Task 4

**Chatbot**: Amazing work! Let us start Task 4. How can you go from the Supermarket to the Fire Station? Write a complete paragraph with linking words.

**User**: To go from the Supermarket to the Fire Station, exit the Supermarket. Turn left into East Street. Walk past the Bakery. Turn left into North Street. The Fire Station is on your right.

**Chatbot**: Great paragraph! Let’s check your work.

*Calling reading_the_map_adv_3 tool with startLocation="Supermarket" and endLocation="Fire Station".*

*Tool output (not shown to user): Exit the Supermarket. Turn left into East Street. Walk west from E1 to E2. Turn left into North Street. Walk north to N3. The Fire Station is on your right.*

| Original | Revised |
|----------|---------|
| To go from the Supermarket to the Fire Station, exit the Supermarket. | **First**, to go from the Supermarket to the Fire Station, exit the Supermarket. |
| Turn left into East Street. | **Then**, turn left into East Street. |
| Walk past the Bakery. | **After that**, walk past the Bakery. |
| Turn left into North Street. | **Then**, turn left into North Street. |
| The Fire Station is on your right. | **Finally**, the Fire Station is on **your right**. |

Please review the feedback. Do you accept the revisions? Want to try another pair or move to another task?

**User**: Task 5

**Chatbot**: Great! Let us start Task 5. Can you read my map? Please: 1. Draw a map of the neighborhood from your home to school. 2. Upload your drawing to the chatbot.

**User**: *Uploads a drawing of a map with Home, Park, Library, and School. The route is: exit Home, turn right into Main Street, walk past the Park, turn left into School Road, School is on the left.* 

My route: Exit home. Walk past park. Turn left into school road. School on left.

**Chatbot**: Wonderful map! I see your Home, Park, Library, and School. Let’s check your route.

*No reading_the_map_adv_3 tool used, as per Task 5 rules. Analyzing user’s uploaded map description.*

| Original | Revised |
|----------|---------|
| Exit home. | **E**xit the Home. |
| Walk past park. | **W**alk past the Park. |
| Turn left into school road. | **T**urn left into School Road. |
| School on left. | The School is on **your left**. |

Great job! Please review the feedback. Do you accept the revisions? Want to describe another route or try another task?

**User**: I accept. I’m done!

**Chatbot**: Congratulations! You have completed all tasks. Want to talk more about directions or try another route?

---

**Notes**:
- The user explicitly calls each task (Task 1 to Task 5) to switch, as requested.
- Tasks 1-2 use same-street locations (Post Office to Hospital, Book Shop to Police Station) with 2-3 buildings between them.
- Tasks 3-4 use different-street locations (Clinic to Bank, Supermarket to Fire Station) for multi-step directions.
- Task 5 uses the user’s uploaded map, avoids the `reading_the_map_adv_3` tool, and corrects only writing conventions and common phrases.
- Correction tables follow the prompt’s rules: bold only changed parts, correct grammar, capitalization, punctuation, and directional accuracy (Tasks 1-4 verified with tool).
- The chatbot uses A1-A2 language, avoids cardinal directions, and guides step-by-step without suggesting specific phrases.
- Map display HTML is omitted as per your instruction.
- The interaction is cheerful, encouraging, and tracks progress step-by-step.