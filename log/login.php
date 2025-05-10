<?php

session_start();
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ensure the fields are not empty
    if (empty($_POST['username']) || empty($_POST['password'])) {
        $error = "All fields are required.";
    } else {
        $studentid = mysqli_real_escape_string($conn, $_POST['username']);
        $password = $_POST['password'];

        // Query to check if the user exists
        $stmt = $conn->prepare("SELECT * FROM ctpg_users WHERE StudentID = ? LIMIT 1");
        if (!$stmt) {
            die("SQL Error: " . $conn->error);
        }

        $stmt->bind_param("s", $studentid);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            // Verify the password
            if (password_verify($password, $user['Password'])) {
                // Set session variables
                $_SESSION['studentid'] = $user['StudentID'];
                $_SESSION['username'] = $user['Name'];

                // Redirect to dashboard
                header("Location: ../capstone.html");
                exit();
            } else {
                $error = "Invalid password.";
            }
        } else {
            $error = "Student ID not found.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Login</title>
</head>
<body>
    <div class="container">
        <div class="image-section">
            <img src="illus.jpg" alt="Illustration" class="illustration">
        </div>
        <div class="form-section">
            <h1>STUDENT LOGIN</h1>
            <form action="login.php" method="POST">
                <div class="input-group">
                    <label for="username">Enter Your Student ID</label>
                    <input type="text" id="username" name="username" required>
                </div>
              
                <div class="input-group">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" required>
                        <img id="togglePassword" src="hidden.png" alt="Show Password" class="toggle-password">
                    </div>
                </div>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="/ctpg/reg/register.php">Register here</a></p>
            <?php if (isset($error)): ?>
                <p style="color: red;"><?php echo $error; ?></p>
            <?php endif; ?>
        </div>
    </div>

    <style>
    /* Style for the password wrapper */
    .password-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .password-wrapper input {
        width: 100%;
        padding-right: 40px; /* Add space for the toggle icon */
    }

    .toggle-password {
        position: absolute;
        right: 10px;
        width: 25px;
        height: 25px;
        cursor: pointer;
        transition: opacity 0.3s ease;
    }

    .toggle-password:hover {
        opacity: 0.7;
    }
    </style>

    <script>
        // JavaScript to toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        const passwordField = document.getElementById('password');

        togglePassword.addEventListener('click', function () {
            // Toggle the type attribute
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);

            // Toggle the image
            this.src = type === 'password' ? 'hidden.png' : 'eye.png';
            this.alt = type === 'password' ? 'Show Password' : 'Hide Password';
        });
    </script>

</body>
</html>