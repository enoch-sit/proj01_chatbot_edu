# Teacher Script Segment 6 - 100:00-120:00 (IDOR Defense + XSS Discovery)

## 🎯 Learning Objectives

By the end of this 20-minute segment, students will be able to:

- ✅ Understand how to fix IDOR using authorization checks
- ✅ Know what XSS (Cross-Site Scripting) means using the birthday card analogy
- ✅ Successfully inject JavaScript code into the chatbot
- ✅ See malicious code execute (`alert()` popup)
- ✅ Understand why XSS is dangerous (can steal cookies, redirect users, deface pages)
- ✅ Feel the power (and danger!) of code injection

## 📦 Materials Needed

- [ ] Code editor open with server.js
- [ ] Browser with chatbot ready
- [ ] Whiteboard for drawing birthday card analogy
- [ ] Student laptops ready for XSS injection
- [ ] Stickers for successful JavaScript execution

## 🗣️ Exact Script

---

### [100:00-102:00] - Recap & Introduce This Segment's Flow

**[TEACHER SAYS]:**

"Welcome back, hackers! Alright, quick check - **raise BOTH hands if you successfully became admin in the last segment!**"

**[STUDENTS RAISE BOTH HANDS]**

**[TEACHER SAYS]:**

"Look at all these admins! Amazing!

Okay, we're now HALFWAY through our 3-hour workshop! We've learned so much:

- ✅ Prompt Injection (tricking the AI)
- ✅ Data Leakage (finding hidden secrets)
- ✅ IDOR (pretending to be someone else)

That's 3 vulnerabilities discovered and defended!

For this segment, we're going to:

1. **QUICKLY fix IDOR** (5 minutes) - add authorization checks
2. **Discover XSS** (15 minutes) - one of the MOST FAMOUS web vulnerabilities!

XSS stands for Cross-Site Scripting. It's when you inject MALICIOUS CODE into a website that other users will execute!

Sound scary? It is! But also SUPER cool to learn! Ready? **Thumbs up!**"

**[STUDENTS GIVE THUMBS UP]**

---

### [102:00-107:00] - Quick Defense Demo: Fixing IDOR

**[TEACHER SAYS]:**

"Alright, how do we fix IDOR?

Remember the problem: Anyone can change their `userId` and access someone else's data!

The fix: **ALWAYS CHECK AUTHORIZATION!**

Before showing sensitive data, ask: **'Is this person ALLOWED to see this?'**

Let me show you in code!"

**[TEACHER DOES]:**

- Open code editor
- Find an endpoint that returns user-specific data (like chat history)

**[TEACHER SAYS]:**

"Right now, our code might look like this:"

```javascript
app.get('/api/messages/:userId', (req, res) => {
  const userId = req.params.userId; // Get userId from URL
  const messages = getMessagesForUser(userId);
  res.json(messages); // Send messages back
});
```

**[TEACHER SAYS]:**

"See the problem? It takes whatever `userId` you provide in the URL and just returns the messages!

If you go to: `/api/messages/1` → You get admin's messages!  
If you go to: `/api/messages/2` → You get regular user's messages!

**NO CHECK to see if you're ALLOWED to see those messages!**

Here's the FIX:"

```javascript
app.get('/api/messages/:userId', (req, res) => {
  const requestedUserId = req.params.userId; // Who they're asking about
  const loggedInUserId = req.session.userId; // Who they actually are
  
  // 🛡️ AUTHORIZATION CHECK!
  if (requestedUserId !== loggedInUserId) {
    return res.status(403).json({
      error: 'Forbidden! You can only view YOUR OWN messages!'
    });
  }
  
  // If we get here, they're authorized!
  const messages = getMessagesForUser(requestedUserId);
  res.json(messages);
});
```

**[TEACHER SAYS]:**

"See the difference?

**Line 2-3:** We get TWO user IDs:

- `requestedUserId` = Who they're asking about (from the URL)
- `loggedInUserId` = Who they actually are (from their login session)

**Lines 5-9:** We CHECK: Are these the same person?

- If NO → Return error 403 (Forbidden)
- If YES → Continue and show the data!

**This is AUTHORIZATION!** We verify: 'Are you allowed to do this?'

It's like a librarian checking: 'This is library card 12345. Is that YOUR card? Show me ID!'

**That's the fix for IDOR!**

Of course, in a real system, you'd also allow ADMINS to view any user's data (for support purposes). You'd check:

`if (requestedUserId !== loggedInUserId && loggedInRole !== 'admin')`

But the core principle is the same: **ALWAYS VERIFY PERMISSIONS!**

Make sense? **Thumbs up!**"

**[CHECK FOR THUMBS]**

**[TEACHER SAYS]:**

"Perfect! Now let's move on to something REALLY exciting: **Cross-Site Scripting!**"

---

### [107:00-110:00] - The Birthday Card Analogy (What is XSS?)

**[TEACHER SAYS]:**

"Okay, forget computers again. Let's talk about birthday cards! 🎂

Imagine it's your friend's birthday. You buy them a nice card, write 'Happy Birthday!' inside, and mail it to them.

They open the card, read your message, smile, and put it on their shelf.

**Normal, innocent, harmless, right?**"

**[STUDENTS NOD]**

**[TEACHER SAYS]:**

"Now imagine this: You're a PRANKSTER. You want to trick your friend!

So you buy a birthday card, but inside, you write:

**'When you read this message, stand up and sing the national anthem at the top of your lungs!'**

You mail it to your friend. They open it. They read the message. And because they're following the instructions, they ACTUALLY STAND UP AND START SINGING! 😂

**Your friend just executed YOUR instructions without realizing it was a trick!**

That's basically what XSS is!

But instead of tricking a person, you're tricking a COMPUTER (specifically, a web browser)!

Let me explain with a web example."

**[TEACHER DOES]:**

- Draw on whiteboard:

```
NORMAL MESSAGE:
User types: "Hello!"
Chatbot displays: "Hello!"
✅ Safe - just text

XSS ATTACK:
User types: "<script>alert('HACKED!')</script>"
Chatbot displays: ??? 
❌ DANGER - this is CODE, not text!
```

**[TEACHER SAYS]:**

"See, in HTML (the language websites are written in), there's a special tag called `<script>`.

Anything inside `<script>...</script>` is treated as JAVASCRIPT CODE that the browser will EXECUTE!

So if a user types:

`<script>alert('HACKED!')</script>`

And the website displays that message WITHOUT ESCAPING IT (cleaning it), the browser sees it and thinks:

'Oh! That's code! I should RUN it!'

And BOOM - the code executes! A popup appears that says 'HACKED!'

**That's XSS - Cross-Site Scripting!**

It's called 'Cross-Site' because the malicious code CROSSES from one user (the attacker) to another user (the victim) via the website!

Let me break it down:

- **Cross:** The attack crosses between users
- **Site:** It happens on a website
- **Scripting:** JavaScript scripts are injected

**Analogy refresher:**

- Birthday card = Chat message
- Hidden instruction = `<script>` code
- Friend following instruction = Browser executing code

Make sense? **Shout 'YES!' if you understand!**"

**[STUDENTS SHOUT "YES!"]**

---

### [110:00-114:00] - Attack: Inject JavaScript into the Chatbot

**[TEACHER SAYS]:**

"Alright! Time to ATTACK! Let's try to inject JavaScript into our chatbot!

The simplest XSS payload (attack code) is:

`<script>alert('XSS!')</script>`

This will make a popup appear that says 'XSS!'

If the popup appears, we KNOW the JavaScript executed - which means the chatbot is VULNERABLE to XSS!

Let me try it!"

**[TEACHER DOES]:**

1. Open chatbot (logged in)
2. In the message box, type: `<script>alert('XSS!')</script>`
3. Click Send
4. Wait for response

**[IF VULNERABLE - POPUP APPEARS]:**

**[TEACHER SAYS - EXCITEDLY]:**

"WHOA! Look at that! A POPUP appeared that says 'XSS!'

**THE JAVASCRIPT CODE EXECUTED!**

This means the chatbot took our message, displayed it on the screen, and the browser saw `<script>` and thought: 'Oh, that's code! I should run it!'

**WE JUST SUCCESSFULLY PERFORMED AN XSS ATTACK!**

Now you might think: 'So what? It's just a popup. Big deal.'

But here's the thing - if we can execute `alert()`, we can execute ANY JavaScript code!

For example:

- **Steal cookies:** `<script>alert(document.cookie)</script>` - Shows all saved login tokens!
- **Redirect to malicious site:** `<script>window.location='http://evil.com'</script>`
- **Deface the page:** `<script>document.body.innerHTML='HACKED!'</script>`
- **Keylogging:** Record every key the user presses!
- **Steal passwords:** Capture form inputs when user types!

**XSS is EXTREMELY DANGEROUS!**

In fact, XSS is one of the MOST COMMON vulnerabilities on the web! It's #3 on the OWASP Top 10 list!

Companies get BREACHED because of XSS! User data gets STOLEN! Accounts get HIJACKED!

But YOU just learned how to exploit it! Let's all try it!"

**[IF NOT VULNERABLE - NO POPUP]:**

**[TEACHER SAYS]:**

"Hmm, nothing happened. The chatbot might already have some protection.

Let me try a different payload..."

**[TRY VARIATIONS]:**

- `<img src=x onerror=alert('XSS')>`
- `<svg onload=alert('XSS')>`
- `<body onload=alert('XSS')>`

**[ONCE ONE WORKS, CONTINUE]:**

---

### [114:00-117:00] - Students Inject XSS Payloads

**[TEACHER SAYS]:**

"Alright! YOUR turn to inject code!

**Try this payload:** `<script>alert('I am a hacker!')</script>`

Type it exactly - including the angle brackets `< >` and the quotes `' '`!

Click Send and see if you get a popup!

You have 3 minutes - GO!"

**[TEACHER DOES]:**

- Set 3-minute timer
- Walk around helping students
- Common issues:
  - Typo in code → Help them type it exactly
  - Forgot quotes → Show on screen: `alert('message')` needs quotes!
  - Used wrong brackets → Must be `<script>` not `{script}` or `[script]`

**[AS STUDENTS SUCCEED]:**

**[CELEBRATE LOUDLY]:**

"YES! [Student name] got a popup! They just injected code!"

**[GIVE STICKERS TO SUCCESSFUL HACKERS]**

**[AFTER 3 MINUTES]:**

**[TEACHER SAYS]:**

"Quick check - **raise your hand if you got a popup!**"

**[MOST HANDS SHOULD BE UP]**

"AMAZING! You all just exploited XSS!

Now let's try something MORE ADVANCED! Let's steal some data!

**Try this payload:** `<script>alert(document.cookie)</script>`

This will show all the COOKIES (saved login data) in your browser!

Try it now! 1 minute!"

**[STUDENTS TRY IT]**

**[TEACHER SAYS]:**

"Look at what appears! You can see:

- Session IDs
- Login tokens
- User preferences

If an attacker stole these cookies, they could IMPERSONATE YOU and log in as you WITHOUT KNOWING YOUR PASSWORD!

**That's why XSS is so dangerous!**

One more! **Try this:** `<script>document.body.style.background='red'</script>`

This will turn the entire page background RED! It's a simple defacement attack!"

**[STUDENTS TRY IT - PAGE TURNS RED]**

**[TEACHER SAYS - LAUGHING]:**

"Look at that! The whole page is red now! You just DEFACED the website!

Imagine if this were:

- A news website → You could change the headlines!
- A bank website → You could change account balances shown!
- A social media site → You could change what people see in their feed!

**XSS gives you CONTROL over what other users see and experience!**

This is POWERFUL and DANGEROUS!

Give yourselves a round of applause - you're all XSS hackers now!"

**[STUDENTS APPLAUD]**

---

### [117:00-120:00] - Discussion: Why XSS is Dangerous + Wrap-up

**[TEACHER SAYS]:**

"Alright, let's talk about the REAL-WORLD IMPACT of XSS.

**Famous XSS Attacks in History:**

**1. MySpace Samy Worm (2005)**

- A guy named Samy injected XSS code into his MySpace profile
- When anyone viewed his profile, the code executed
- The code made them automatically add Samy as a friend
- Then it copied itself to THEIR profile!
- Within 20 hours, over 1 MILLION people had added Samy as a friend!
- MySpace had to shut down to fix it!

**2. British Airways (2018)**

- Hackers injected XSS code into the checkout page
- When customers entered credit card info, the code STOLE it!
- 380,000 credit cards were compromised!
- British Airways was fined £20 MILLION!

**3. eBay (2014)**

- XSS vulnerability allowed attackers to inject fake listings
- Users thought they were buying from eBay, but money went to attackers!

**4. Twitter (2010)**

- XSS attack made tweets automatically retweet themselves
- Spread like wildfire - thousands of users affected in minutes!

See? XSS is NOT just a 'fun popup'! It causes REAL DAMAGE!

**Why do XSS vulnerabilities exist?**

Same reason as other bugs:

- Programmers forget to ESCAPE user input (convert `<` to `&lt;`)
- They use dangerous functions like `innerHTML` instead of safe ones like `textContent`
- They trust user input without SANITIZING it

**The fix is simple:** NEVER TRUST USER INPUT! Always escape it!

We'll learn how to defend against XSS in the next segment!

But first, let's recap this segment:

**✅ IDOR Defense:**

- Always check: Is this person ALLOWED to access this data?
- Compare `requestedUserId` with `loggedInUserId`
- Return 403 Forbidden if they don't match!

**✅ XSS Discovery:**

- XSS = Injecting malicious JavaScript code into a website
- Birthday card analogy: Hidden instructions that trick the receiver
- We injected: `<script>alert('XSS')</script>`
- We stole cookies: `<script>alert(document.cookie)</script>`
- We defaced the page: `<script>document.body.style.background='red'</script>`

**✅ Real-world impact:**

- MySpace worm, British Airways breach, eBay scam, Twitter attack
- Millions of users affected, millions of dollars in fines!

You all did INCREDIBLE! We're now 2 hours into the workshop!

In the next segment, we're going to:

1. **Fix XSS** by escaping user input
2. **Discover Excessive Agency** - when AI chatbots have too much power!

Imagine giving a robot a CHAINSAW and telling it to 'make me a sandwich'! 😱

That's what we're learning next!

Excited? **Wave your hands in the air if you're excited!**"

**[STUDENTS WAVE HANDS]**

**[TEACHER SAYS]:**

"Perfect! Take a 2-minute break. Stretch, hydrate, and when you come back, we're learning about AI with too much power!

See you in 2!"

**[SET 2-MINUTE TIMER]**

---

## 🎬 Transition to Next Segment

**[WHEN STUDENTS RETURN]:**

"Alright AI tamers! Ready to see what happens when chatbots have too much power? Let's discover Excessive Agency! Here we go!"

**[PROCEED TO SEGMENT 7: teacher_script_07_140min.md]**

---

## ✅ Success Indicators for This Segment

- ✅ **70%+ students** understand IDOR fix (authorization check)
- ✅ **90%+ students** understand the birthday card analogy for XSS
- ✅ **85%+ students** successfully executed JavaScript (`alert` popup appeared)
- ✅ **70%+ students** tried advanced payloads (stealing cookies, defacing page)
- ✅ **All students** recognize XSS as a serious threat (not just a harmless popup)
- ✅ **High energy** - students excited about seeing code execute

## 🚨 Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| XSS payload doesn't work | Try alternative: `<img src=x onerror=alert('XSS')>` or `<svg onload=alert('XSS')>` |
| Student typed it wrong | Show on screen exactly - including all brackets and quotes |
| Popup appears but immediately closes | That's normal! The code executed - success! |
| Page crashes after injection | Refresh the page - they successfully executed code! |
| Student scared by popup | Reassure: "That's GOOD! It means the attack worked! This is a safe environment to learn!" |
| Cookie alert shows nothing | Some browsers block `document.cookie` - explain that's a security feature, but the ATTEMPT proves vulnerability |

## 📝 Teacher Notes

- **Energy level**: VERY HIGH! XSS is exciting - visible, immediate impact!
- **Key teaching moment**: When popup first appears - pause and emphasize: "This is CODE EXECUTION! This is SERIOUS!"
- **Important concept**: XSS is not just about popups - it's about CONTROL
- **If running behind**: Skip advanced payloads (cookies, defacement), just do basic `alert()`
- **If running ahead**: Introduce types of XSS (Reflected, Stored, DOM-based)
- **Analogies to reinforce**: Birthday card with hidden instructions, trojan horse
- **Real-world connection**: MySpace Samy worm is a GREAT story - students remember it!
- **Safety reminder**: "This is ILLEGAL on real websites without permission! We're learning in a safe lab environment!"

## 🎯 Key Vocabulary Introduced

- **XSS (Cross-Site Scripting)**: Injecting malicious JavaScript code into a website
- **Payload**: The actual attack code you inject (like `<script>alert('XSS')</script>`)
- **Code Execution**: When the browser runs your malicious code
- **Cookie Stealing**: Using XSS to steal login tokens and session data
- **Defacement**: Changing how a website looks using injected code
- **Escaping**: Converting dangerous characters (like `<`) to safe ones (like `&lt;`)
- **Sanitizing**: Cleaning user input to remove malicious code
- **innerHTML**: Dangerous function that executes code (vs `textContent` which is safe)

## 💡 Extension Activities (If Time Allows)

- **Bonus Challenge**: "Can you inject code that changes the page title? Hint: `document.title = 'HACKED'`"
- **Discussion**: "What's the WORST thing you could do with XSS? (Don't actually do it!)"
- **Scenario**: "If this were Facebook, what could an attacker do with XSS?"
- **Career Moment**: "XSS hunters get paid BIG money through bug bounties - Google pays up to $7,500 for XSS!"
- **Types of XSS**:
  - **Reflected XSS:** Code is in the URL, executes when victim clicks link
  - **Stored XSS:** Code is saved in database, executes for everyone who views it
  - **DOM-based XSS:** Code manipulates the page structure directly

## 🔥 Passion Points (Energy Boosters)

- When first popup appears: **"STOP EVERYTHING! CODE JUST EXECUTED! THIS IS REAL HACKING!"**
- When cookie steal works: **"YOU JUST STOLE SESSION TOKENS! In real life, you could log in as someone else NOW!"**
- When page turns red: **"YOU CONTROL THE PAGE! You could change ANYTHING users see!"**
- Story time: **"The MySpace Samy worm spread to 1 MILLION users in 20 HOURS! That's the power of XSS!"**
- Career connection: **"Companies are DESPERATE for people who know XSS! This is your ticket to a security career!"**

## 🎓 Academic Connections

- **Computer Science**: Understanding how browsers parse and execute HTML/JavaScript
- **Ethics**: Discussion about responsible disclosure - if you find XSS in a real site, REPORT IT, don't exploit it!
- **Mathematics**: Exponential growth (MySpace worm spreading) - show the math of how 1 → 10 → 100 → 1000 → 1,000,000 in hours
- **Law**: Computer Fraud and Abuse Act (CFAA) - XSS attacks are FELONIES without permission!
- **Psychology**: Social engineering - why do people click malicious links? How do attackers trick users?
