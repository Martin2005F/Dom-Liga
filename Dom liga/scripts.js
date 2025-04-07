document.addEventListener("DOMContentLoaded", () => {
  const prijaviBtn = document.querySelector(".btn");
  const teamSelect = document.querySelector(".team-select");
  const confirmation = document.querySelector(".confirmation");
  const imeInput = document.querySelectorAll(".input-box input")[0];
  const prezimeInput = document.querySelectorAll(".input-box input")[1];
  const nicknameInput = document.querySelectorAll(".input-box input")[2];

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
  const itemWidth = 100; // Width + margin/gap
  const visibleItems = 4;

  let selectedClub = "";
  let selectedLogo = "";

  // Store registered users to check for duplicate nicknames
  let registeredNicknames = [];
  // Store used clubs to make them unavailable
  let usedClubs = [];

  // On page load, fetch existing data
  fetchExistingData();

  // Function to fetch existing data from server
  function fetchExistingData() {
    fetch("get_existing_data.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          registeredNicknames = data.nicknames;
          usedClubs = data.clubs;
          disableUsedClubs();
        }
      })
      .catch((error) => {
        console.error("Error loading existing data:", error);
      });
  }

  // Function to disable clubs that are already taken
  function disableUsedClubs() {
    teamIcons.forEach((icon) => {
      if (usedClubs.includes(icon.alt)) {
        icon.classList.add("disabled");
        icon.title = "Ovaj klub je već odabran";
      }
    });
  }

  // Moving the slider
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
    const maxIndex = slider.children.length - visibleItems;
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSlider();
    }
  });

  // Team selection
  teamIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      // Skip if the club is already taken
      if (icon.classList.contains("disabled")) {
        return;
      }

      teamIcons.forEach((el) => el.classList.remove("selected"));
      icon.classList.add("selected");
      selectedClub = icon.alt;
      selectedLogo = icon.src;
    });
  });

  // Register button click
  prijaviBtn.addEventListener("click", () => {
    const ime = imeInput.value.trim();
    const prezime = prezimeInput.value.trim();
    const nickname = nicknameInput.value.trim();

    if (!ime || !prezime || !nickname) {
      alert("Popuni sva polja!");
      return;
    }

    // Check if nickname is already taken
    if (registeredNicknames.includes(nickname.toLowerCase())) {
      alert("Ovaj nickname je već zauzet! Molimo odaberite drugi.");
      nicknameInput.value = "";
      nicknameInput.focus();
      return;
    }

    document.querySelector(".container").classList.add("hidden");
    teamSelect.classList.remove("hidden");
  });

  // Save user data to server
  function saveUserData() {
    const userData = {
      ime: imeInput.value.trim(),
      prezime: prezimeInput.value.trim(),
      nickname: nicknameInput.value.trim(),
      club: selectedClub,
    };

    // Send data to server
    fetch("save_user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Show confirmation
          teamSelect.classList.add("hidden");
          confirmation.classList.remove("hidden");

          confIme.textContent = userData.ime;
          confPrezime.textContent = userData.prezime;
          confNick.textContent = userData.nickname;
          confKlub.textContent = userData.club;
          confLogo.src = selectedLogo;
        } else {
          alert("Greška: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          "Došlo je do greške prilikom spremanja podataka! Pokušajte ponovno."
        );
      });
  }

  // Confirm team selection
  confirmBtn.addEventListener("click", () => {
    if (!selectedClub) {
      alert("Odaberi tim!");
      return;
    }

    // Save data to server
    saveUserData();
  });
});
