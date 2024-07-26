document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const emailInput = form.querySelector('input[name="email"]');
    const nameInput = form.querySelector('input[name="name"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const submitButton = form.querySelector('button[type="submit"]');
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent the default form submission
  
      // Basic validation
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const name = nameInput.value.trim();
  
      if (!email || !password || !name) {
        alert('Please fill in all fields.');
        return;
      }
  
      try {
        submitButton.disabled = true; // Disable button to prevent multiple submissions
  
        const response = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, name })
        });
  
        if (response.ok) {
          // Assuming successful signup returns a message or status
          alert('Sign up successful! Redirecting...');
          window.location.href = '/'; // Redirect to home or login page
        } else {
          // Handle server-side validation or other errors
          const error = await response.text();
          alert(`Sign up failed: ${error}`);
        }
      } catch (error) {
        console.error('Error during sign up:', error);
        alert('An error occurred during sign up. Please try again later.');
      } finally {
        submitButton.disabled = false; // Re-enable the button
      }
    });
  });
  