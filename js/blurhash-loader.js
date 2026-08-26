/**
 * BlurHash LQIP (Low-Quality Image Placeholder) Loader
 * 
 * Applies blur placeholders to images at runtime without modifying the HTML structure.
 * This avoids layout issues caused by wrapping images in extra containers.
 */
(function () {
  'use strict';

  // Base64 placeholder map — tiny 32×32 JPEG thumbnails generated from each image
  const PLACEHOLDERS = {
    'front-face.jpg':  'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABgcFA//EACAQAAEEAgIDAQAAAAAAAAAAAAEAAgMEBSEGEhExYUH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABYRAQEBAAAAAAAAAAAAAAAAAAARMf/aAAwDAQACEQMRAD8Apx9LKtTAPK05T1jcfiJZO50lO0sJW7WlBWgw+QjGMt9yNpFBJ5alpI5X5wyEgFTTk+VZWkJc72dBMcpZIgdv8Ud5HadZysgJ1HoIuG3G8syw0FrvKdU7ILBtQ/j1t9bJMaCesmiPqquNsl0Q2ia//9k=',
    'side-face.jpg':   'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGQAAAwADAAAAAAAAAAAAAAAAAwQFAQIH/8QAHxAAAgEEAwEBAAAAAAAAAAAAAQIAAwQRIQUSMRMi/8QAFgEBAQEAAAAAAAAAAAAAAAAAAQIA/8QAGREBAAMBAAAAAAAAAAAAAAAAAAECETH/2gAMAwEAAhEDEQA/AObVW7DUJaqQ2YEqV9jdthvIYIOq+FiN42Y98SViF2hX2aVV62u0wmpnjFJbcJV/QxGLGmFIilSSkOkk8rTwhxLa6SSuSHZSIaX/2Q==',
    'ridesync.png':    'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAABAIDBQb/xAAcEAACAwEAAwAAAAAAAAAAAAAAAgEDIREEIjH/xAAYAQACAwAAAAAAAAAAAAAAAAAAAgEDBP/EABcRAAMBAAAAAAAAAAAAAAAAAAABAhH/2gAMAwEAAhEDEQA/AOBSOyJVMKqNkYqxw03WFUh2XA9kDrIwJZ9IlgyHjvo9HwyKG4w+tsGpaMlhba2ArH5IiycM+5vYEkGH/9k=',
    'housefix.png':    'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAwQFAgf/xAAfEAABBAIDAQEAAAAAAAAAAAABAAIDBBEhEjFBUWH/xAAYAQADAQEAAAAAAAAAAAAAAAABAwQAAv/EABgRAQEBAQEAAAAAAAAAAAAAAAECACJB/9oADAMBAAIRAxEAPwDoclpvHtSrlhrs7U2W87HaSktuJ2V1Qmwjjyjm7S3HHhLRzj0phthv1LJXFoMJ0Jwk52FqtysAapdoZyrhL0lQzo8th0Z0hi+/9Tj6weekM0wPESZMvt93/9k=',
    'portfolio.png':   'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAABQYHBAH/xAAiEAABBAICAgMBAAAAAAAAAAABAAIDBAUhERIiMRNBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABcRAQEBAQAAAAAAAAAAAAAAAAASESH/2gAMAwEAAhEDEQA/ADdiQdCl6/IA47Wyzb4YdpNzeWIkMcR8vs/iqNBip2G9vaO1pQWjal9LKzQzD5Hdmk7/AInfH3e8YPKmS7dgeYzwkLKV5Ybby8Hhx0VXLFVpb6QG7jI5HHloKquYE7q1pLMoZG0nez+J5xtR8cLRvQWipjI43eLQEbr1Who0isL/2Q==',
    'portal.png':      'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGwAAAQQDAAAAAAAAAAAAAAAABQABAwQCBgf/xAAhEAACAgEDBQEAAAAAAAAAAAAAAgEDBBESMRMhIkFRYf/EABYBAQEBAAAAAAAAAAAAAAAAAAECA//EABcRAQEBAQAAAAAAAAAAAAAAAAEAAhH/2gAMAwEAAhEDEQA/AOl2PCKD3ylhuSxlq2ydADfFnU9mmSjTGkyVmOTCzJX6DqYfT2Nar/ouSBbYnWGWYkH24yy/AQdtqlN7PIzGtlXjLEcDWY6/CVbOxHZaTx7OUv/Z',
    'primeware.png':   'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAQFBgMH/8QAIhAAAgEDBAMBAQAAAAAAAAAAAAECAwQRBRIhMUEGE2Fx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEB/9oADAMBAAIRAxEAPwD0WVeCp7pSUUvbMvqPk0aM50q0Lr2zlY3X8M5rHkk60Wl6pZT6z0H+5M2GlUn+EZvT/JqlaLi5oqUfyZYpNePU6ybjJxa+M1FLxDS6Ck1Qgm/rSAZqv/2Q==',
    'memories.png':    'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAQFBgP/xAAfEAACAQQDAQEAAAAAAAAAAAABAgADBAURIRIxQVH/xAAXAQADAQAAAAAAAAAAAAAAAAAAAQID/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEB/9oADAMBAAIRAxEAPwDqMnmLeyBNRwEE8hkL25INKm2D9PqeWMx9O3AJ2xm7FUbcaUcghCY42JsNPiR3tzTthmQgIxJOrZa6+CElH//Z',
    'documentary.png': 'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAABAUGAgP/xAAhEAACAQQCAwEBAAAAAAAAAAAAAQIDBAURIRIxBhNBUf/EABcBAAMBAAAAAAAAAAAAAAAAAAACAwH/xAAYEQEBAQEBAAAAAAAAAAAAAAABABECIf/aAAwDAQACEQMRAD8A6C+8ttLOm5VK6WPwSeXvMKrhGjbTee/sLzH2dW6r/bWfE/qkGWN1GLB3luinKk8olrvzS8v8tUaijHrjArZ+K3Lq/bWSb+Jf4Psr4rU33BJ/wAApYdqvhFem9VK2n6FN7cBo2UKFNRpxSS/ALoJu0X/2Q==',
    'production.png':  'data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgACADASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAUGBAMH/8QAIhAAAQMDBAMBAAAAAAAAAAAAAQACAwQFERIhMVEGE0FB/8QAFwEAAwEAAAAAAAAAAAAAAAAAAgMEBf/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8Ar6qohpY9c7w1o7UlrvPrSmSIKUEuAJzgdlJX223G7TfyDQz6AEspfHqWjyHunYC7oJFfGInMDVXYybS7qo+l2WQ4ZICe5T08f8fggaZJ2l7ui7kpxEeEzaB9hNMklFSU0LJJZAGN5ynl15Rb0xDKN0er2pBJNddm/9k='
  };

  function applyBlurPlaceholders() {
    var images = document.querySelectorAll('img[src*="assets/img/"]');

    images.forEach(function (img) {
      // Skip if already processed
      if (img.dataset.blurApplied) return;
      img.dataset.blurApplied = 'true';

      var filename = img.getAttribute('src').split('/').pop();
      var placeholder = PLACEHOLDERS[filename];
      if (!placeholder) return;

      // Apply the placeholder as background on the image's parent container
      // This avoids wrapping images and breaking layouts
      var parent = img.parentElement;
      if (!parent) return;

      // Store original background so we can clean up
      var origBg = parent.style.backgroundImage;
      var origBgSize = parent.style.backgroundSize;

      // Convert base64 to Blob URL to bypass Chrome/Lighthouse ERR_INVALID_URL bug for data URIs in CSS
      var byteString = atob(placeholder.split(',')[1]);
      var mimeString = placeholder.split(',')[0].split(':')[1].split(';')[0];
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      var blob = new Blob([ab], {type: mimeString});
      var blobUrl = URL.createObjectURL(blob);

      parent.style.backgroundImage = "url('" + blobUrl + "')";
      parent.style.backgroundSize = 'cover';
      parent.style.backgroundPosition = 'center';

      // Make image transparent until loaded
      if (!img.complete) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s ease-in-out';

        img.addEventListener('load', function onLoad() {
          img.style.opacity = '1';
          // Clean up placeholder background after fade-in completes
          setTimeout(function () {
            parent.style.backgroundImage = origBg || '';
            parent.style.backgroundSize = origBgSize || '';
            parent.style.backgroundPosition = '';
            URL.revokeObjectURL(blobUrl);
          }, 500);
          img.removeEventListener('load', onLoad);
        });

        img.addEventListener('error', function onError() {
          // On error, remove placeholder and show fallback
          parent.style.backgroundImage = origBg || '';
          parent.style.backgroundSize = origBgSize || '';
          parent.style.backgroundPosition = '';
          URL.revokeObjectURL(blobUrl);
          img.style.opacity = '1';
          img.removeEventListener('error', onError);
        });
      } else {
        // Image already cached/loaded — show immediately
        img.style.opacity = '1';
        parent.style.backgroundImage = origBg || '';
        parent.style.backgroundSize = origBgSize || '';
        parent.style.backgroundPosition = '';
        URL.revokeObjectURL(blobUrl);
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBlurPlaceholders);
  } else {
    applyBlurPlaceholders();
  }
})();
