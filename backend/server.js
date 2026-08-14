 console.log("server file updated");
 require("dotenv").config({ path: "./.env" });

console.log("ENV VALUE:", process.env.MONGO_URI);
const express = require("express");
const mongoose = require("mongoose");
const Habit = require("./models/habit");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
const dns = require("dns");

const app = express();


app.use(function( req, res, next)  {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.use(cors());


dns.setServers(["1.1.1.1", "8.8.8.8"]);
app.use(express.json());
// MongoDB Atlas connection
console.log("ENV:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (_req, res) => {
  res.send("Server is running");
});
app.post("/add", auth ,async (req, res) => {
  try {
    const newHabit = new Habit({
      title: req.body.title,
      category : req.body.category,
      userId: req.user.id,
    });

    await newHabit.save();
    res.json(newHabit);
  } catch (err) {
    res.send(err);
  }
});

app.get("/habits", auth ,async (req, res) => {
  try {
    const habits = await Habit.find({
    userId: req.user.id
  });
    const today = new Date();
    
    for (let habit of habits) {
      const lastReset = new Date(habit.lastResetDate);

      const isNewDay =
        today.toDateString() !== lastReset.toDateString();

      if (isNewDay) {
        habit.completed = false;
        habit.lastResetDate = today;
        await habit.save();
      }
    }

    const updatedHabits = await Habit.find({
      userId: req.user.id
    });
     

    res.json(updatedHabits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});



app.delete("/habits/:id", async (req, res) => {
      console.log("DELETE HIT:",req.params.id);
  try {
    const { id } = req.params;

    const deletedHabit = await Habit.findByIdAndDelete(id);

    if (!deletedHabit) {
      return res.status(404).send("Habit not found");
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/habits/:id/toggle", async (req, res) => {
  console.log(" TOGGLE ROUTE HIT", req.params.id);
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

     const today = new Date();

    if (!habit.completed) {
      // Marking as completed
      const today = new Date();
      today.setHours(0,0,0,0);
       if (habit.lastCompleted) {
        const today = new Date();
      today.setHours(0,0,0,0);
        const lastDate = new Date(habit.lastCompleted);
        lastDate . setHours(0,0,0,0);

        const diffDays =
          (today - lastDate) / (1000 * 60 * 60 * 24);

          console.log("Today:", today);
console.log("Last Date:", lastDate);
console.log("Diff Days:", diffDays)

        if (diffDays === 1) {
          habit.streak += 1; // consecutive day
        } else if (diffDays > 1) {
          habit.streak = 1; // streak broken
        }
        if (habit.streak > habit.longestStreak) {
  habit.longestStreak = habit.streak;
}
      } else {
        habit.streak = 1; // first completion
        habit.longestStreak = 1;
      }

      const now = new Date();

const todayString = now.toDateString();

const alreadyCompletedToday = habit.history.some(
  (d) => new Date(d).toDateString() === todayString
);

habit.lastCompleted = now;

if (!alreadyCompletedToday) {
  habit.history.push(now);
}
    }

   if (!habit.completed) {
  habit.completed = true;
} else {
  habit.completed = false;
}

    await habit.save();
    console.log ("updated:", habit);

    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: "Error updating habit" });
  }
});
app.put("/habits/:id", async (req, res) => {
  console.log("EDIT ROUTE HIT");
  console.log(req.params.id);
  try {
    const updatedHabit =
      await Habit.findByIdAndUpdate(
        req.params.id,
        { title: req.body.title },
        { new: true }
      );

    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
app.post("/signup", async (req, res) => {
  console.log("BODY:", req.body);
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    

    await user.save();

    res.json({
      message: "Signup successful"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

    


app.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required"
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name
    } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        googleId
      });

      await user.save();
    } else {
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      "mysecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token
    });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);

    res.status(500).json({
      message: "Google login failed"
    });
  }
});

   


app.get("/test", (req, res) => {
  res.send("TEST WORKING");
})

// Server start
app.listen(5000, () => {
  console.log("Server started on port 5000");
});