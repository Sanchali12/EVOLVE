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
//const dns = require("dns");

const app = express();
const nodemailer = require("nodemailer");
const dns = require("dns");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("VERIFY ERROR:", error);
  } else {
    console.log("SMTP Server is ready");
  }
});
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
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      "mysecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Email not registered.",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token and expiry in database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Reset-password page on your frontend
    const resetLink =
  `https://frontend-hazel.vercel.app/reset-password/${resetToken}`;

    const info = await transporter.sendMail({
      from: `"EVOLVE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your EVOLVE password",
      text: `We received a request to reset your EVOLVE password.

Click this link to reset your password:

${resetLink}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

- EVOLVE Team`,
    });

    console.log("Password reset email sent:", info.messageId);

    res.json({
      success: true,
      message: "Password reset email sent successfully.",
    });

  } catch (err) {
    console.error("FULL ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required.",
      });
    }

    // Find user with matching token that has not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    // Remove the reset token so it cannot be reused
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully.",
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
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