# Workshop Day Checklist

**Print this page and check off items as you complete them!**

---

## ⏰ 30 Minutes Before Workshop

### Technology Setup

- [ ] Laptop fully charged and plugged in
- [ ] Both demos running successfully
  - [ ] Vulnerable demo on localhost:3000
  - [ ] Secure demo on localhost:3001
- [ ] Presentation opened (workshop-slides.md)
- [ ] Browser with multiple tabs ready:
  - [ ] localhost:3000
  - [ ] localhost:3000/api/users
  - [ ] localhost:3000/api/debug
  - [ ] localhost:3001
- [ ] Code editor open with both demo folders
- [ ] Terminal windows ready (2-3 terminals)

### Display Setup

- [ ] Screen sharing tested (if virtual)
- [ ] Projector working (if in-person)
- [ ] Resolution set correctly
- [ ] Browser zoom at comfortable level
- [ ] Font size readable from back of room

### Materials Ready

- [ ] FACILITATOR-GUIDE.md open for reference
- [ ] Exercise files accessible
- [ ] Backup USB drive with all files
- [ ] Backup demos (screenshots/recordings)

### Communication

- [ ] Meeting link shared (if virtual)
- [ ] Mute/unmute working
- [ ] Chat window visible
- [ ] Breakout rooms configured (if needed)

---

## ⏰ 10 Minutes Before Workshop

### Final Checks

- [ ] Water bottle nearby ☕
- [ ] Phone on silent
- [ ] Notifications disabled
- [ ] Close unnecessary applications
- [ ] Test microphone/camera (if virtual)

### Participant Setup

- [ ] Welcome message in chat
- [ ] Pre-work reminder sent
- [ ] Setup instructions available
- [ ] Waiting room enabled (if using)

### Mindset

- [ ] Take 3 deep breaths 🧘
- [ ] Review opening talking points
- [ ] Remember: You've got this! 💪

---

## 🎯 During Workshop - Quick Reference

### Opening (10 min)

- [ ] Welcome participants
- [ ] Icebreaker poll
- [ ] Set expectations
- [ ] Ground rules

### Lecture (20 min)  

- [ ] Slides 3-11
- [ ] Cover all vulnerability types
- [ ] Real-world examples
- [ ] Check for understanding

### Live Demo (20 min)

- [ ] Demo 1: Prompt Injection
- [ ] Demo 2: IDOR
- [ ] Demo 3: Hidden Endpoints
- [ ] Q&A

### Break (10 min)

- [ ] Announce break clearly
- [ ] Give prep instructions for next section
- [ ] Return time specified

### Red Team (30 min)

- [ ] Divide teams
- [ ] Distribute challenges
- [ ] Circulate and help
- [ ] Track points
- [ ] Debrief findings

### Blue Team (30 min)

- [ ] Assign tasks
- [ ] Provide guidance
- [ ] Check progress
- [ ] Test fixes
- [ ] Debrief solutions

### Advanced Topics (20 min)

- [ ] Slides 23-32
- [ ] OWASP Top 10
- [ ] Tools overview
- [ ] Production considerations

### Hands-On Build (20 min)

- [ ] Assign individual tasks
- [ ] Circulate and help
- [ ] Share solutions
- [ ] Discuss approaches

### Wrap-Up (20 min)

- [ ] Key takeaways
- [ ] Resources shared
- [ ] Q&A
- [ ] Feedback survey
- [ ] Thank participants

---

## 🔧 Troubleshooting Quick Fixes

### Server Issues

**Won't start:**

```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <number> /F

# Restart
cd vulnerable-demo
npm start
```

**Crashed:**

```bash
# Ctrl+C to stop
# npm start to restart
```

### Demo Issues

**Attack not working:**

- Check you're on port 3000 (vulnerable)
- Refresh browser
- Clear console
- Verify exact command

**Code broken:**

- Have backup copy ready
- Use Git reset if versioned
- Switch to backup demo
- Use screenshots as fallback

### Participant Issues

**Can't install:**

- Direct to README.md
- Pair with working participant
- Use cloud-based alternative if available

**Behind on exercises:**

- Adjust their goals
- Focus on key tasks only
- Extend time if possible

---

## 📊 Timing Checkpoints

| Time | Milestone | Where You Should Be |
|------|-----------|---------------------|
| 0:10 | After opening | Finished intro, starting lecture |
| 0:30 | After lecture | Finished slides 1-11 |
| 0:50 | After demos | Completed all 3 demos |
| 1:00 | Start hour 2 | Break finished, teams formed |
| 1:15 | Mid Red Team | Teams attacking, making progress |
| 1:30 | Red Team done | Debrief complete |
| 1:45 | Mid Blue Team | Teams fixing code |
| 2:00 | Blue Team done | Debrief complete, break if needed |
| 2:20 | Advanced topics | Slides 23-32 covered |
| 2:40 | Mid hands-on | Participants building |
| 2:50 | Wrap starting | Final Q&A beginning |
| 3:00 | Workshop end | Feedback collected, done! |

---

## 💡 Energy Management

### Keep Energy High

- [ ] Stand when presenting (if able)
- [ ] Use vocal variety
- [ ] Ask questions frequently
- [ ] Celebrate successes
- [ ] Use humor appropriately

### Monitor Engagement

- [ ] Check chat regularly
- [ ] Watch for confused faces
- [ ] Ask "Are you with me?"
- [ ] Adjust pace as needed

### If Energy Drops

- [ ] Quick stretch break
- [ ] Interactive poll
- [ ] Pair/share activity
- [ ] Switch presentation style

---

## 📝 Notes Section

**Issues encountered:**
_________________________________
_________________________________
_________________________________

**Great questions asked:**
_________________________________
_________________________________
_________________________________

**Things to improve next time:**
_________________________________
_________________________________
_________________________________

**Positive moments:**
_________________________________
_________________________________
_________________________________

---

## ✅ Post-Workshop (Within 30 min)

- [ ] Thank participants in chat
- [ ] Share feedback survey
- [ ] Share additional resources
- [ ] Answer immediate questions
- [ ] Save chat/Q&A log
- [ ] Back up any modified code
- [ ] Send follow-up email (template below)

---

## 📧 Follow-Up Email Template

```
Subject: Chatbot Security Workshop - Resources & Next Steps

Hi everyone,

Thank you for participating in today's workshop! Here are the resources 
we covered:

📁 Workshop Materials:
- All code and slides: [link]
- Additional exercises: [link]
- Setup guide: [link]

📚 Recommended Resources:
- OWASP Top 10 for LLMs: [link]
- HackTheBox: [link]
- Additional readings: [link]

🎯 Next Steps:
1. Complete all Red Team challenges
2. Implement all Blue Team fixes
3. Try the bonus challenges
4. Apply concepts to your projects

❓ Questions?
Feel free to reach out: [your email]

📊 Feedback:
Please share your thoughts: [survey link]

Thanks again for your participation!

[Your name]
```

---

## 🏆 Success Indicators

Workshop went well if you see:

- [ ] Active participation
- [ ] Lots of questions
- [ ] Teams discussing
- [ ] "Aha!" moments
- [ ] Participants helping each other
- [ ] Positive energy
- [ ] On time (mostly)
- [ ] Minimal technical issues
- [ ] Positive feedback

---

## 🎉 You Did It

After workshop:

- [ ] Celebrate! You taught cybersecurity! 🎉
- [ ] Hydrate and rest
- [ ] Review notes
- [ ] Process feedback
- [ ] Update materials for next time

**Remember:** Every workshop improves. You're building important skills
in participants and making the internet safer!

---

**Workshop Date:** _______________  
**Location/Platform:** _______________  
**Participants:** _______________  
**Overall Success:** ⭐⭐⭐⭐⭐

**You've got this! 💪🛡️**
