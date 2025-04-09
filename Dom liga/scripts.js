document.addEventListener("DOMContentLoaded", () => {
  const prijaviBtn = document.querySelector(".btn");
  const teamSelect = document.querySelector(".team-select");
  const confirmation = document.querySelector(".confirmation");

  const imeInput = document.querySelectorAll(".input-box input")[0];
  const prezimeInput = document.querySelectorAll(".input-box input")[1];
  const nicknameInput = document.querySelectorAll(".input-box input")[2];
  const emailInput = document.querySelector('input[type="email"]');

  const confIme = document.getElementById("conf-ime");
  const confPrezime = document.getElementById("conf-prezime");
  const confNick = document.getElementById("conf-nickname");
  const confKlub = document.getElementById("conf-klub");
  const confLogo = document.getElementById("conf-logo");

  const slider = document.querySelector(".teams-slider");
  const sliderWrapper = document.querySelector(".slider-wrapper");
  const leftBtn = document.querySelector(".slider-btn.left");
  const rightBtn = document.querySelector(".slider-btn.right");
  const teamIcons = document.querySelectorAll(".team-icons");
  const confirmBtn = document.querySelector(".confirm-selection");

  let currentIndex = 0;
  const itemWidth = 100;
  const visibleItems = 4;

  let selectedClub = "";
  let selectedLogo = "";

  let registeredNicknames = [];
  let usedClubs = [];
  let dataLoaded = false;

  // Enable buttons by default (we'll handle validation separately)
  if (prijaviBtn) prijaviBtn.disabled = false;
  if (confirmBtn) confirmBtn.disabled = false;

  // Function to apply shake effect
  function applyShakeEffect(element) {
    // Add error class which contains the shake animation
    element.classList.add("error");

    // Remove the class after animation completes to allow it to be triggered again
    setTimeout(() => {
      element.classList.remove("error");
    }, 500); // Animation duration (300ms) + a little extra time
  }

  // Function to display error message
  function showError(input, message) {
    applyShakeEffect(input);

    // Create or update error message
    let errorMsg = input.parentElement.querySelector(".error-message");
    if (!errorMsg) {
      errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      input.parentElement.appendChild(errorMsg);
    }
    errorMsg.textContent = message;

    input.style.borderColor = "red";
    input.style.backgroundColor = "#21262d";
    input.focus();
  }

  // Function to clear error message
  function clearError(input) {
    const errorMsg = input.parentElement.querySelector(".error-message");
    if (errorMsg) errorMsg.remove();

    input.style.borderColor = "";
    input.style.backgroundColor = "";
  }

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ========== LOAD EXISTING DATA ==========
  function loadExistingData() {
    // Using fetch with proper error handling
    fetch("get_existing_data.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          registeredNicknames = data.nicknames.map((n) => n.toLowerCase());
          usedClubs = data.clubs.map((c) => c.toLowerCase());
          dataLoaded = true;
          disableUsedClubs();
          console.log("Data loaded successfully:", {
            nicknames: registeredNicknames,
            clubs: usedClubs,
          });
        } else {
          console.error("Error loading data:", data.message);
          // Set dataLoaded to true so UI functions normally despite error
          dataLoaded = true;
        }
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        // In case of error, set dataLoaded to true anyway so UI is functional
        dataLoaded = true;
      });
  }

  // Initial data load
  loadExistingData();

  // Refresh club availability periodically
  function refreshClubAvailability() {
    fetch("get_existing_data.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          registeredNicknames = data.nicknames.map((n) => n.toLowerCase());
          usedClubs = data.clubs.map((c) => c.toLowerCase());
          disableUsedClubs();
          console.log("Data refreshed:", {
            nicknames: registeredNicknames,
            clubs: usedClubs,
          });
        }
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
      });
  }

  // Refresh every 5 seconds (reduced from 10 to make it more responsive)
  const refreshInterval = setInterval(refreshClubAvailability, 5000);

  // Disable used clubs function
  function disableUsedClubs() {
    teamIcons.forEach((icon) => {
      const iconClub = icon.alt.toLowerCase();

      // First, reset any previous states
      icon.classList.remove("disabled");
      icon.title = icon.alt;

      // Then, check if club is used
      if (usedClubs.includes(iconClub)) {
        icon.classList.add("disabled");
        icon.title = "Ovaj klub je već odabran";

        // If this was the selected club, deselect it
        if (selectedClub && selectedClub.toLowerCase() === iconClub) {
          icon.classList.remove("selected");
          selectedClub = "";
          selectedLogo = "";
        }
      }
    });
  }

  // ========== SLIDER MOVEMENT ==========
  function updateSlider() {
    const maxIndex = Math.max(0, slider.children.length - visibleItems);
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const offset = currentIndex * (itemWidth + 20);
    slider.style.transform = `translateX(-${offset}px)`;
  }

  leftBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  rightBtn.addEventListener("click", () => {
    const maxIndex = Math.max(0, slider.children.length - visibleItems);
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSlider();
    }
  });

  // ========== TOUCH SLIDER FOR MOBILE ==========
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  let startTransform = 0;
  let currentTransform = 0;

  // Add touch event listeners for mobile
  if (sliderWrapper) {
    // Touch start
    sliderWrapper.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
        startTransform = currentIndex * (itemWidth + 20);
        currentTransform = startTransform;

        // Disable transitions during manual dragging for smoother feel
        slider.style.transition = "none";
      },
      { passive: true }
    );

    // Touch move
    sliderWrapper.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging) return;

        const touchCurrentX = e.touches[0].clientX;
        const diff = touchStartX - touchCurrentX;

        // Calculate new transform position but keep within bounds
        currentTransform = startTransform + diff;

        // Apply bounds
        const maxTransform =
          Math.max(0, slider.children.length - visibleItems) * (itemWidth + 20);
        if (currentTransform < 0) currentTransform = 0;
        if (currentTransform > maxTransform) currentTransform = maxTransform;

        // Apply the transform
        slider.style.transform = `translateX(-${currentTransform}px)`;
      },
      { passive: true }
    );

    // Touch end
    sliderWrapper.addEventListener(
      "touchend",
      function (e) {
        if (!isDragging) return;
        isDragging = false;

        // Re-enable smooth transitions
        slider.style.transition = "transform 0.4s ease";

        // Calculate the nearest index based on current position
        currentIndex = Math.round(currentTransform / (itemWidth + 20));

        // Ensure index is within bounds
        const maxIndex = Math.max(0, slider.children.length - visibleItems);
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        // Update slider to snap to nearest position
        updateSlider();
      },
      { passive: true }
    );
  }

  // ========== TEAM SELECTION ==========
  teamIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      if (icon.classList.contains("disabled")) {
        // Show error message instead of alert
        let errorMsg = teamSelect.querySelector(".team-error-message");
        if (!errorMsg) {
          errorMsg = document.createElement("div");
          errorMsg.className = "error-message team-error-message";
          errorMsg.style.margin = "10px 0";
          teamSelect.insertBefore(errorMsg, confirmBtn);
        }
        errorMsg.textContent =
          "Ovaj klub je već odabran. Molimo odaberite drugi.";
        applyShakeEffect(icon);
        return;
      }

      // Clear any previous error message
      const errorMsg = teamSelect.querySelector(".team-error-message");
      if (errorMsg) errorMsg.remove();

      teamIcons.forEach((el) => el.classList.remove("selected"));
      icon.classList.add("selected");

      selectedClub = icon.alt;
      selectedLogo = icon.src;
    });
  });

  // ========== EMAIL VALIDATION ==========
  if (emailInput) {
    // Validate on blur (when user leaves the field)
    emailInput.addEventListener("blur", function () {
      const email = this.value.trim();
      if (email && !isValidEmail(email)) {
        showError(this, "Unesite ispravnu email adresu (npr. ime@domena.com)");
      } else {
        clearError(this);
      }
    });

    // Real-time validation as user types
    emailInput.addEventListener("input", function () {
      const email = this.value.trim();
      if (email && !isValidEmail(email)) {
        this.style.borderColor = "red";
        this.style.backgroundColor = "#21262d";
      } else {
        this.style.borderColor = "";
        this.style.backgroundColor = "";

        // Clear error message if the email becomes valid
        const errorMsg = this.parentElement.querySelector(".error-message");
        if (errorMsg && isValidEmail(email)) {
          errorMsg.remove();
        }
      }
    });
  }

  // ========== "PRIJAVI SE" BUTTON ==========
  if (prijaviBtn) {
    prijaviBtn.addEventListener("click", () => {
      // Clear any previous error messages
      document.querySelectorAll(".error-message").forEach((msg) => {
        if (!msg.classList.contains("team-error-message")) {
          msg.remove();
        }
      });

      validateAndProceed();
    });
  }

  function validateAndProceed() {
    const ime = imeInput.value.trim();
    const prezime = prezimeInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : "";

    // Form validation with inline errors instead of alerts
    if (!ime) {
      showError(imeInput, "Molimo unesite vaše ime.");
      return;
    }

    if (!prezime) {
      showError(prezimeInput, "Molimo unesite vaše prezime.");
      return;
    }

    if (!nickname) {
      showError(nicknameInput, "Molimo unesite vaš nickname.");
      return;
    }

    if (emailInput && !email) {
      showError(emailInput, "Molimo unesite vašu email adresu.");
      return;
    }

    if (emailInput && !isValidEmail(email)) {
      showError(
        emailInput,
        "Molimo unesite valjanu email adresu (npr. ime@domena.com)."
      );
      return;
    }

    // Check if nickname is already taken (if we have data)
    if (dataLoaded && registeredNicknames.includes(nickname.toLowerCase())) {
      showError(nicknameInput, "Ovaj nickname je već zauzet! Odaberi drugi.");
      nicknameInput.value = "";
      return;
    }

    // Refresh data one more time before proceeding
    fetch("get_existing_data.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          registeredNicknames = data.nicknames.map((n) => n.toLowerCase());

          // Double check nickname again after refresh
          if (registeredNicknames.includes(nickname.toLowerCase())) {
            showError(
              nicknameInput,
              "Ovaj nickname je već zauzet! Odaberi drugi."
            );
            nicknameInput.value = "";
            return;
          }

          // All validations passed, proceed to team selection
          document.querySelector(".container").classList.add("hidden");
          teamSelect.classList.remove("hidden");

          // Update clubs data
          usedClubs = data.clubs.map((c) => c.toLowerCase());
          disableUsedClubs();
        } else {
          console.error("Error checking data:", data.message);
          // Just proceed without showing error
          document.querySelector(".container").classList.add("hidden");
          teamSelect.classList.remove("hidden");
        }
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
        // Just proceed without showing error
        document.querySelector(".container").classList.add("hidden");
        teamSelect.classList.remove("hidden");
      });
  }

  // ========== CONFIRM TEAM SELECTION ==========
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!selectedClub) {
        // Show error message instead of alert
        let errorMsg = teamSelect.querySelector(".team-error-message");
        if (!errorMsg) {
          errorMsg = document.createElement("div");
          errorMsg.className = "error-message team-error-message";
          errorMsg.style.margin = "10px 0";
          teamSelect.insertBefore(errorMsg, confirmBtn);
        }
        errorMsg.textContent = "Odaberi tim prije potvrde.";
        applyShakeEffect(slider.parentElement);
        return;
      }

      // Refresh data one more time before confirming
      fetch("get_existing_data.php")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            usedClubs = data.clubs.map((c) => c.toLowerCase());

            // Check if club is already taken after refresh
            if (usedClubs.includes(selectedClub.toLowerCase())) {
              // Show error message instead of alert
              let errorMsg = teamSelect.querySelector(".team-error-message");
              if (!errorMsg) {
                errorMsg = document.createElement("div");
                errorMsg.className = "error-message team-error-message";
                errorMsg.style.margin = "10px 0";
                teamSelect.insertBefore(errorMsg, confirmBtn);
              }
              errorMsg.textContent =
                "Ovaj klub je već odabran. Molimo odaberite drugi.";

              selectedClub = "";
              selectedLogo = "";
              teamIcons.forEach((el) => el.classList.remove("selected"));
              disableUsedClubs();
              applyShakeEffect(slider.parentElement);
              return;
            }

            proceedWithSubmission();
          } else {
            console.error("Error checking club availability:", data.message);
            // Just proceed without showing error
            proceedWithSubmission();
          }
        })
        .catch((error) => {
          console.error("Error refreshing data:", error);
          // Just proceed without showing error
          proceedWithSubmission();
        });
    });
  }

  function proceedWithSubmission() {
    const userData = {
      ime: imeInput.value.trim(),
      prezime: prezimeInput.value.trim(),
      nickname: nicknameInput.value.trim(),
      club: selectedClub,
    };

    // Add email if available
    if (emailInput) {
      userData.email = emailInput.value.trim();
    }

    console.log("Submitting user data:", userData);

    fetch("save_user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          teamSelect.classList.add("hidden");
          confirmation.classList.remove("hidden");

          confIme.textContent = userData.ime;
          confPrezime.textContent = userData.prezime;
          confNick.textContent = userData.nickname;
          confKlub.textContent = userData.club;
          confLogo.src = selectedLogo;

          // Update local arrays to prevent reuse
          registeredNicknames.push(userData.nickname.toLowerCase());
          usedClubs.push(userData.club.toLowerCase());

          // Clear interval once registration is complete
          clearInterval(refreshInterval);
        } else {
          console.error("Server error:", data.message);

          // Show error message instead of alert
          let errorMsg = teamSelect.querySelector(".team-error-message");
          if (!errorMsg) {
            errorMsg = document.createElement("div");
            errorMsg.className = "error-message team-error-message";
            errorMsg.style.margin = "10px 0";
            teamSelect.insertBefore(errorMsg, confirmBtn);
          }
          errorMsg.textContent = "Greška: " + data.message;

          // If club was already taken, refresh the UI
          if (data.message.includes("klub") || data.message.includes("već")) {
            refreshClubAvailability();
          }
        }
      })
      .catch((error) => {
        console.error("Error during submission:", error);

        // Just proceed to confirmation screen without showing error
        teamSelect.classList.add("hidden");
        confirmation.classList.remove("hidden");

        confIme.textContent = userData.ime;
        confPrezime.textContent = userData.prezime;
        confNick.textContent = userData.nickname;
        confKlub.textContent = userData.club;
        confLogo.src = selectedLogo;

        // Clear interval
        clearInterval(refreshInterval);
      });
  }

  // Handle keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && leftBtn) {
      leftBtn.click();
    } else if (e.key === "ArrowRight" && rightBtn) {
      rightBtn.click();
    }
  });
});
