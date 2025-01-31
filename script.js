// Wait for the fire animation to finish, then reveal the links
document.addEventListener('DOMContentLoaded', () => {
  const fireContainer = document.getElementById('fire-container');
  const linkContainer = document.getElementById('link-container');

  setTimeout(() => {
    fireContainer.remove(); // Remove the fire animation
    linkContainer.classList.remove('hidden');
    linkContainer.classList.add('visible');
  }, 2000); // Match the duration of the fire animation
});
