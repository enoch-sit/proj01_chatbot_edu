# Teacher Script Segment 5 - 80:00-100:00 (Data Leakage Defense + IDOR Discovery)

## 🎯 Learning Objectives

By the end of this 20-minute segment, students will be able to:

- ✅ Understand how to HIDE sensitive data using redaction/filtering
- ✅ Add authentication checks to API endpoints
- ✅ Understand what IDOR (Insecure Direct Object Reference) means using library card analogy
- ✅ Successfully exploit IDOR to access other users' private data
- ✅ Feel the power of "pretending to be someone else" in a system
- ✅ Recognize authorization vs authentication

## 📦 Materials Needed

- [ ] Code editor open with server.js
- [ ] Browser with chatbot and dev console ready
- [ ] Whiteboard for drawing IDOR analogy
- [ ] Student laptops ready for hands-on hacking
- [ ] Stickers for successful IDOR attacks

## 🗣️ Exact Script

---

### [80:00-82:00] - Recap & Split Focus (Defense + New Attack)

**[TEACHER SAYS]:**

"Welcome back, cyber defenders! Quick energy check - **stand up and stretch if you found at least 3 secrets in the last segment!**"

**[STUDENTS STAND AND STRETCH]**

**[TEACHER SAYS]:**

"Awesome! Sit back down!

Okay, so we just went on a TREASURE HUNT and found:

- System prompts with secret instructions
- `/api/users` with ALL passwords in plain text
- `/api/config` with database credentials
- SO MUCH leaked data!

Now normally, we'd spend 20 minutes learning how to DEFEND against all those leaks. But here's the thing - we're running out of time and we have MORE vulnerabilities to discover!

So I'm going to do something different. I'm going to:

1. **QUICKLY show you the fix** for data leakage (5 minutes)
2. **Then introduce a NEW attack** called IDOR - Insecure Direct Object Reference (15 minutes)

Why? Because in real life, you need to know BOTH how to defend AND how to find NEW attack surfaces!

Sound good? **Thumbs up if you're ready for a fast-paced segment!**"

**[STUDENTS GIVE THUMBS UP]**

---

### [82:00-87:00] - Quick Defense Demo: Hiding Sensitive Data

**[TEACHER SAYS]:**

"Alright, DEFENSE TIME! How do we fix data leakage?

**Three main strategies:**

**Strategy #1: DON'T CREATE THE ENDPOINT IN THE FIRST PLACE!**

- If you don't need `/api/users` to be public, DELETE IT!
- Why have a back door if nobody needs it?
- Simplest fix: Remove the vulnerability entirely!

**Strategy #2: REQUIRE AUTHENTICATION**

- Before showing data, CHECK: 'Who is asking? Are they logged in?'
- If not logged in → Show error: 'Access denied!'
- Only logged-in users can see data!

**Strategy #3: FILTER/REDACT SENSITIVE DATA**

- Even if user is logged in, DON'T show passwords!
- Replace passwords with: `'***REDACTED***'`
- Only show data the user NEEDS to see!

Let me show you Strategy #3 - redaction - in code!"

**[TEACHER DOES]:**

- Open code editor, find the `/api/users` endpoint
- Show current code (returns ALL data including passwords)

**[TEACHER SAYS]:**

"Right now, this endpoint returns EVERYTHING:"

```javascript
app.get('/api/users', (req, res) => {
  res.json(users); // Returns ALL user data including passwords!
});
```

**[TEACHER SAYS]:**

"See? It just dumps the entire `users` array with NO filtering!

Now watch what we do to FIX it:"

```javascript
app.get('/api/users', (req, res) => {
  // Create a SAFE version with passwords removed
  const safeUsers = users.map(user => {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      // Password is NOT included! It's redacted!
    };
  });
  
  res.json(safeUsers);
});
```

**[TEACHER SAYS]:**

"See the difference?

**Before:** Return EVERYTHING (including passwords)  
**After:** Create a NEW list called `safeUsers` that only includes:

- ID
- Username
- Email

**PASSWORDS ARE LEFT OUT!** They're redacted! Removed! Hidden!

Now if someone accesses `/api/users`, they'll see usernames and emails (which might be okay for a public directory), but they WON'T see passwords!

**That's defense against data leakage!**

Of course, ideally we'd ALSO add authentication (Strategy #2) so only admins can see this list. But redaction alone already makes it 100x safer!

Make sense? **Thumbs up if you understand redaction!**"

**[CHECK FOR THUMBS]**

**[TEACHER SAYS]:**

"Perfect! Now let's move on to our NEW attack: IDOR!

But first, everyone say this word with me: **IN-SECURE  DI-RECT  OB-JECT  REF-ER-ENCE**"

**[STUDENTS REPEAT - PROBABLY STUMBLE ON THE WORDS]**

**[TEACHER SAYS - LAUGHING]:**

"Yeah, it's a mouthful! Just call it IDOR for short! Let's learn what it means!"

---

### [87:00-90:00] - The Library Card Analogy (What is IDOR?)

**[TEACHER SAYS]:**

"Alright, forget computers for a second. Let's go to the library! 📚

Imagine you go to your local library. You have a LIBRARY CARD with your name and a card number. Let's say your card number is **12345**.

When you walk up to the librarian and say: 'I want to check out this book,' the librarian scans YOUR card (12345) and says: 'Okay! This book is now checked out under YOUR account!'

Later, if you want to see YOUR borrowing history, you log into the library website and it shows:

- Books YOU checked out
- Fines YOU owe
- Hold requests YOU made

All based on YOUR card number: 12345.

**This is normal and secure, right?**"

**[STUDENTS NOD]**

**[TEACHER SAYS]:**

"Now imagine this: You log into the library website. The URL looks like this:

`www.library.com/my-account?cardNumber=12345`

See that? Your card number (12345) is IN THE URL!

And you think: 'Hmm... what if I just... CHANGE that number?'

So you manually edit the URL to:

`www.library.com/my-account?cardNumber=12346`

You press Enter... and BOOM! You're now looking at SOMEONE ELSE'S account! You can see:

- Books THEY checked out
- Fines THEY owe
- Their personal reading history!

**You just used someone else's library card WITHOUT THEIR PERMISSION!**

That's IDOR! **Insecure Direct Object Reference!**

Let me break down that fancy term:

- **Insecure:** Not properly protected
- **Direct:** You're directly accessing something by its ID/number
- **Object:** The 'thing' you're accessing (account, message, file)
- **Reference:** The ID number that identifies it

In simple terms: **Using someone else's ID number to access THEIR private stuff!**

Make sense? **Shout 'YES!' if you understand the library card analogy!**"

**[STUDENTS SHOUT "YES!"]**

**[TEACHER DOES]:**

- Draw on whiteboard:

```
NORMAL (SECURE):
You log in → System knows you're User 12345
You view "My Account" → Shows ONLY your data

IDOR (INSECURE):
You log in as User 12345
You manually change URL to: ?userId=12346
System shows User 12346's data!
❌ System didn't check: "Wait, are you ALLOWED to see this?"
```

---

### [90:00-94:00] - Attack: Exploit IDOR in the Chatbot

**[TEACHER SAYS]:**

"Alright, so does OUR vulnerable chatbot have this problem? Let's find out!

Right now, we're logged in as a regular user. Our User ID is probably 2 (regular user account).

But there's an ADMIN account with User ID 1!

What if we could trick the chatbot into showing us the ADMIN'S private messages?

Let me show you how!"

**[TEACHER DOES]:**

1. Open browser with chatbot (logged in as regular user)
2. Right-click on page → Click "Inspect" or press F12
3. This opens the Developer Console

**[TEACHER SAYS]:**

"Whoa! What's all this? Don't panic!

This is called the DEVELOPER CONSOLE - it's a secret tool built into every browser that lets you see 'behind the scenes' of a website.

You can see:

- The HTML code
- JavaScript code
- Network requests
- Cookies
- Local storage

Programmers use this to DEBUG (fix) problems. But hackers use it to FIND SECURITY HOLES!

Now watch this. I'm going to type a command that CHANGES my user ID!"

**[TEACHER DOES]:**

- Click on the "Console" tab in the dev tools
- Type: `localStorage.setItem('userId', '1')`
- Press Enter

**[TEACHER SAYS]:**

"What did I just do?

I told the browser: 'Hey, save a value called userId and set it to 1 (the admin's ID)!'

Now when the chatbot checks 'Who is logged in?', it sees: 'Oh, User ID 1! That's the admin!'

**But I'm NOT the admin! I just PRETENDED to be the admin by changing my ID!**

Now let me refresh the page and see what happens..."

**[TEACHER DOES]:**

- Refresh the page (F5)
- The chatbot might now show: "Welcome, admin!" or show admin-only features

**[TEACHER SAYS]:**

"LOOK AT THAT! It says 'Welcome, admin!' now!

**I SUCCESSFULLY IMPERSONATED THE ADMINISTRATOR!**

This is IDOR in action! I changed the object reference (user ID) and the system didn't verify: 'Wait, are you REALLY the admin?'

Now let me check my chat history..."

**[TEACHER DOES]:**

- Navigate to a page that shows chat messages or account details
- If the vulnerability is properly built, it should show admin's private data

**[TEACHER SAYS]:**

"OH MY GOODNESS! Look at this! I can now see:

- The admin's private messages!
- The admin's secret conversations!
- Sensitive internal discussions!

**This is a MASSIVE privacy violation!**

Imagine if this were:

- A hospital system → You access someone else's medical records!
- A bank → You access someone else's account balance!
- A social media site → You read someone else's private DMs!

**IDOR vulnerabilities are CRITICAL!**

Companies get sued for MILLIONS when this happens!

But guess what? YOU'RE going to try it too! Let's all become admins!"

---

### [94:00-98:00] - Students Exploit IDOR

**[TEACHER SAYS]:**

"Alright! YOUR turn to hack! Here's the step-by-step:

**Step 1:** Right-click anywhere on the chatbot page  
**Step 2:** Click 'Inspect' or 'Inspect Element' (or press F12)  
**Step 3:** Find the 'Console' tab at the top  
**Step 4:** Type this EXACTLY: `localStorage.setItem('userId', '1')`  
**Step 5:** Press Enter  
**Step 6:** Refresh the page (F5)  
**Step 7:** Check if you're now logged in as admin!

You have 4 minutes - GO! And if you get stuck, raise your hand!"

**[TEACHER DOES]:**

- Set 4-minute timer
- Walk around helping students
- Common issues:
  - Can't find Inspect → Right-click anywhere, look for 'Inspect'
  - Can't find Console tab → It's usually at the top of the dev tools window
  - Typo in command → Help them retype it exactly
  - Nothing changes after refresh → Check if userId actually changed: `localStorage.getItem('userId')`

**[AS STUDENTS SUCCEED]:**

**[TEACHER SAYS EXCITEDLY]:**

"YES! [Student name] just became admin! Look at their screen!"

**[CELEBRATE EACH SUCCESS WITH STICKERS]**

**[AFTER 4 MINUTES]:**

**[TEACHER SAYS]:**

"Alright! Quick check - **raise your hand if you successfully changed your User ID and accessed admin features!**"

**[MOST HANDS SHOULD BE UP]**

"FANTASTIC! You all just exploited an IDOR vulnerability!

Now let me ask you: **Was there ANY security check? Did the system ask for a password? Did it verify you're really the admin?**"

**[STUDENTS SHAKE HEADS - "NO!"]**

"Exactly! It just TRUSTED whatever ID you provided!

It's like the library system trusting whatever card number you type in WITHOUT checking if that card actually belongs to you!

**This is why AUTHORIZATION is critical!**

Remember earlier I mentioned:

- **Authentication** = Checking WHO you are (login with password)
- **Authorization** = Checking WHAT you're ALLOWED to do

This system has authentication (you logged in with a password), but it has BROKEN authorization (it doesn't check if you're allowed to access admin features)!

Give yourselves a round of applause - you're all certified IDOR hackers now!"

**[STUDENTS APPLAUD]**

---

### [98:00-100:00] - Wrap-up & Preview Next Segment

**[TEACHER SAYS]:**

"WOW! What a packed segment! Let's recap what we covered in the last 20 minutes!

**✅ DATA LEAKAGE DEFENSE:**

- Strategy #1: Delete unnecessary endpoints
- Strategy #2: Require authentication
- Strategy #3: Redact/filter sensitive data (remove passwords from responses)

**✅ IDOR DISCOVERY:**

- IDOR = Using someone else's ID to access their private data
- Library card analogy: Changing card number in URL to see someone else's account
- We exploited it by changing `userId` from 2 to 1 in localStorage
- System didn't check authorization - just trusted the ID!

**✅ Authentication vs Authorization:**

- **Authentication:** WHO are you? (Login with password)
- **Authorization:** WHAT can you DO? (Are you allowed to access this?)
- Our chatbot has authentication, but BROKEN authorization!

You all did INCREDIBLE! We covered TWO major vulnerabilities in 20 minutes!

Now, in the next segment, we're going to:

1. **Quickly fix the IDOR bug** by adding authorization checks
2. **Discover a NEW attack:** XSS - Cross-Site Scripting!

What's XSS? Imagine sending someone a birthday card, but inside the card is a HIDDEN MESSAGE that tricks them!

That's what we're learning next! We're going to inject MALICIOUS CODE into the chatbot's responses!

Excited? **Stomp your feet if you're excited!**"

**[STUDENTS STOMP FEET - LAUGH AND CHEER]**

**[TEACHER SAYS]:**

"Perfect energy! Take a 2-minute break. Stretch, grab water, and when you come back, we're learning XSS - one of the MOST FAMOUS web vulnerabilities!

See you in 2!"

**[SET 2-MINUTE TIMER]**

---

## 🎬 Transition to Next Segment

**[WHEN STUDENTS RETURN]:**

"Alright script kiddies! Ready to inject some code? Let's discover XSS! Here we go!"

**[PROCEED TO SEGMENT 6: teacher_script_06_120min.md]**

---

## ✅ Success Indicators for This Segment

- ✅ **70%+ students** understand the three defense strategies for data leakage
- ✅ **90%+ students** understand the library card analogy for IDOR
- ✅ **80%+ students** successfully exploited IDOR (changed userId to 1)
- ✅ **All students** can differentiate authentication from authorization
- ✅ **High energy** - students excited about becoming "admin"
- ✅ **Students recognize severity** - understand real-world impact (medical records, bank accounts)

## 🚨 Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| Can't find Inspect option | Try F12, or Ctrl+Shift+I (Windows), Cmd+Option+I (Mac) |
| Console tab not visible | Look for tabs at top of dev tools: Elements, Console, Network - click Console |
| Command gives error | Check for typos - must be exactly: `localStorage.setItem('userId', '1')` |
| Nothing changes after refresh | Verify userId changed: type `localStorage.getItem('userId')` - should return '1' |
| Student overwhelmed by dev tools | Reassure: "Don't worry about all the other stuff - just type what I showed you!" |
| IDOR doesn't work (still shows regular user) | Check if application properly reads from localStorage - might need backend fix |

## 📝 Teacher Notes

- **Energy level**: HIGH - This segment covers A LOT! Keep pace quick!
- **Key teaching moment**: When students first become "admin" - pause and emphasize the severity
- **Important concept**: Authorization vs Authentication - draw clear distinction
- **If running behind**: Skip detailed code walkthrough for data leakage defense, just explain conceptually
- **If running ahead**: Discuss real-world IDOR examples (Facebook 2013, Instagram 2019)
- **Analogies to reinforce**: Library card number, pretending to be someone else
- **Real-world connection**: Mention OWASP Top 10 - both data leakage and broken access control are on the list!

## 🎯 Key Vocabulary Introduced

- **Redaction**: Removing or hiding sensitive information (like passwords) from responses
- **IDOR (Insecure Direct Object Reference)**: Using someone else's ID to access their private data
- **Authentication**: Verifying WHO someone is (login with password)
- **Authorization**: Verifying WHAT someone is allowed to do (checking permissions)
- **Developer Console**: Built-in browser tool for debugging (and hacking!)
- **localStorage**: Browser storage where websites save data (like user IDs, settings)
- **Impersonation**: Pretending to be someone else

## 💡 Extension Activities (If Time Allows)

- **Bonus Challenge**: "Can you access User ID 3? 4? How many users exist?"
- **Discussion**: "What's the difference between a hacker changing their userId and Facebook letting you 'view as' another profile?"
- **Scenario**: "If this were a hospital, what could you see by changing patientId?"
- **Career Moment**: "Authorization bugs are so common that there's an entire OWASP category for them - 'Broken Access Control' is #1 on the OWASP Top 10 list!"
- **Ethical Discussion**: "We're hacking in a safe environment. In real life, this is ILLEGAL without permission. Always get written authorization before testing real systems!"

## 🔥 Passion Points (Energy Boosters)

- When first student becomes admin: **"EVERYONE! STOP! Look at [name]'s screen! They're ADMIN now!"**
- When explaining severity: **"This bug has caused BILLIONS in damages! Equifax breach? IDOR. Instagram DM leak? IDOR!"**
- When students succeed: **"You just pulled off an attack that would get you hired by a security firm!"**
- Analogy emphasis: **"It's like walking into a bank and saying 'I'm here for account 12345' and the teller just HANDS YOU THE MONEY without checking ID!"**
