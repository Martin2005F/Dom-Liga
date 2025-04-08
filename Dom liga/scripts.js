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
          // Show fallback message
          alert(
            "Došlo je do greške pri učitavanju podataka. Neke funkcije možda neće raditi ispravno."
          );
        }
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        // In case of error, set dataLoaded to true anyway so UI is functional
        dataLoaded = true;
        // Fallback by allowing the form to be used
        alert(
          "Nije moguće povezati se s bazom podataka. Registracija će biti omogućena, ali neki klubovi možda već neće biti dostupni."
        );
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

  // ========== TEAM SELECTION ==========
  teamIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      if (icon.classList.contains("disabled")) {
        alert("Ovaj klub je već odabran. Molimo odaberite drugi.");
        return;
      }

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
        this.style.borderColor = "red";
        this.style.backgroundColor = "#21262d";

        // Add error message
        let errorMsg = this.parentElement.querySelector(".error-message");
        if (!errorMsg) {
          errorMsg = document.createElement("div");
          errorMsg.className = "error-message";
          errorMsg.style.color = "red";
          errorMsg.style.fontSize = "12px";
          errorMsg.style.marginTop = "5px";
          this.parentElement.appendChild(errorMsg);
        }
        errorMsg.textContent =
          "Unesite ispravnu email adresu (npr. ime@domena.com)";
      } else {
        this.style.borderColor = "";
        this.style.backgroundColor = "";

        // Remove error message if exists
        const errorMsg = this.parentElement.querySelector(".error-message");
        if (errorMsg) errorMsg.remove();
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
      }
    });
  }

  // ========== "PRIJAVI SE" BUTTON ==========
  if (prijaviBtn) {
    prijaviBtn.addEventListener("click", () => {
      // Even if data isn't loaded, we still allow registration but with warnings
      if (!dataLoaded) {
        const proceed = confirm(
          "Podaci se još učitavaju ili nije moguće povezati se s bazom podataka. Želite li nastaviti?"
        );
        if (!proceed) return;
      }

      const ime = imeInput.value.trim();
      const prezime = prezimeInput.value.trim();
      const nickname = nicknameInput.value.trim();
      const email = emailInput ? emailInput.value.trim() : "";

      // Form validation
      if (!ime) {
        alert("Molimo unesite vaše ime.");
        imeInput.focus();
        return;
      }

      if (!prezime) {
        alert("Molimo unesite vaše prezime.");
        prezimeInput.focus();
        return;
      }

      if (!nickname) {
        alert("Molimo unesite vaš nickname.");
        nicknameInput.focus();
        return;
      }

      if (emailInput && !email) {
        alert("Molimo unesite vašu email adresu.");
        emailInput.focus();
        return;
      }

      if (emailInput && !isValidEmail(email)) {
        alert("Molimo unesite valjanu email adresu (npr. ime@domena.com).");
        emailInput.focus();
        return;
      }

      // Check if nickname is already taken (if we have data)
      if (dataLoaded && registeredNicknames.includes(nickname.toLowerCase())) {
        alert("Ovaj nickname je već zauzet! Odaberi drugi.");
        nicknameInput.value = "";
        nicknameInput.focus();
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
              alert("Ovaj nickname je već zauzet! Odaberi drugi.");
              nicknameInput.value = "";
              nicknameInput.focus();
              return;
            }

            // All validations passed, proceed to team selection
            document.querySelector(".container").classList.add("hidden");
            teamSelect.classList.remove("hidden");

            // Update clubs data
            usedClubs = data.clubs.map((c) => c.toLowerCase());
            disableUsedClubs();
          } else {
            // If API reports error, proceed with warning
            const proceed = confirm(
              "Nije moguće provjeriti dostupnost nadimka. Želite li nastaviti?"
            );
            if (proceed) {
              document.querySelector(".container").classList.add("hidden");
              teamSelect.classList.remove("hidden");
            }
          }
        })
        .catch((error) => {
          console.error("Error refreshing data:", error);

          // Proceed anyway with warning
          const proceed = confirm(
            "Nije moguće provjeriti dostupnost nadimka. Želite li nastaviti?"
          );
          if (proceed) {
            document.querySelector(".container").classList.add("hidden");
            teamSelect.classList.remove("hidden");
          }
        });
    });
  }

  // ========== CONFIRM TEAM SELECTION ==========
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!selectedClub) {
        alert("Odaberi tim prije potvrde.");
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
              alert("Ovaj klub je već odabran. Molimo odaberite drugi.");
              selectedClub = "";
              selectedLogo = "";
              teamIcons.forEach((el) => el.classList.remove("selected"));
              disableUsedClubs();
              return;
            }

            proceedWithSubmission();
          } else {
            // If data refresh fails, ask user if they want to proceed
            const proceed = confirm(
              "Nije moguće provjeriti dostupnost kluba. Želite li nastaviti?"
            );
            if (proceed) {
              proceedWithSubmission();
            }
          }
        })
        .catch((error) => {
          console.error("Error refreshing data:", error);

          // Ask user if they want to proceed
          const proceed = confirm(
            "Nije moguće provjeriti dostupnost kluba. Želite li nastaviti?"
          );
          if (proceed) {
            proceedWithSubmission();
          }
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
          alert("Greška: " + data.message);

          // If club was already taken, refresh the UI
          if (data.message.includes("klub") || data.message.includes("već")) {
            refreshClubAvailability();
          }
        }
      })
      .catch((error) => {
        console.error("Error during submission:", error);

        // Try to directly show the confirmation screen with a fallback message
        const proceed = confirm(
          "Nije moguće povezati se s bazom podataka. Želite li ipak dovršiti registraciju?"
        );

        if (proceed) {
          teamSelect.classList.add("hidden");
          confirmation.classList.remove("hidden");

          confIme.textContent = userData.ime;
          confPrezime.textContent = userData.prezime;
          confNick.textContent = userData.nickname;
          confKlub.textContent = userData.club;
          confLogo.src = selectedLogo;

          // Add a message about possible database connection issues
          const noteElement = document.createElement("p");
          noteElement.innerHTML =
            "<strong style='color:red;'>Napomena:</strong> Registracija možda nije spremljena zbog problema s povezivanjem.";
          confirmation.appendChild(noteElement);

          // Clear interval
          clearInterval(refreshInterval);
        }
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
