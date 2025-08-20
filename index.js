document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide Icons
  lucide.createIcons();

  // --- DOM ELEMENT REFERENCES ---
  const form = document.getElementById("resume-form");
  const inputs = form.querySelectorAll("input, textarea, select");
  const progressBar = document.getElementById("progress-bar");

  // Preview elements
  const resumePreview = document.getElementById("resume-preview");
  const previewName = document.getElementById("preview-name");
  const previewEmail = document.getElementById("preview-email");
  const previewPhone = document.getElementById("preview-phone");
  const previewLinkedin = document.getElementById("preview-linkedin");
  const previewSummary = document.getElementById("preview-summary");
  const previewSkills = document.getElementById("preview-skills");
  const previewExperienceList = document.getElementById(
    "preview-experience-list"
  );
  const previewEducationList = document.getElementById(
    "preview-education-list"
  );
  const previewCustomSectionsContainer = document.getElementById(
    "preview-custom-sections-container"
  );

  // Dynamic section containers
  const experienceList = document.getElementById("experience-list");
  const educationList = document.getElementById("education-list");
  const customSectionsContainer = document.getElementById(
    "custom-sections-container"
  );

  // Buttons
  const addExperienceBtn = document.getElementById("add-experience-btn");
  const addEducationBtn = document.getElementById("add-education-btn");
  const downloadPdfBtn = document.getElementById("download-pdf-btn");
  const clearFormBtn = document.getElementById("clear-form-btn");
  const aiSummaryBtn = document.getElementById("ai-summary-btn");
  const addCustomSectionBtn = document.getElementById("add-custom-section-btn");

  // Skills input
  const skillsContainer = document.getElementById("skills-container");
  const skillsInput = document.getElementById("skills-input");
  const hiddenSkillsInput = document.getElementById("skills");
  let skills = [];

  // --- EVENT LISTENERS ---

  // Update preview on any form input
  form.addEventListener("input", updatePreview);

  // Template selector
  document
    .getElementById("template-selector")
    .addEventListener("change", (e) => {
      resumePreview.className = `bg-white p-6 md:p-8 lg:p-12 rounded-2xl shadow-lg sticky top-8 transition-all duration-300 ${e.target.value}`;
      lucide.createIcons(); // Re-render icons if template changes them
    });

  // Add/Remove dynamic sections
  addExperienceBtn.addEventListener("click", () =>
    addDynamicSection("experience")
  );
  addEducationBtn.addEventListener("click", () =>
    addDynamicSection("education")
  );
  addCustomSectionBtn.addEventListener("click", addCustomSectionForm);

  // Event delegation for removing items/sections
  form.addEventListener("click", (e) => {
    if (e.target.closest(".remove-btn")) {
      e.target.closest(".dynamic-section-item").remove();
      updatePreview();
    }
    if (e.target.closest(".remove-custom-section-btn")) {
      e.target.closest(".custom-section-form").remove();
      updatePreview();
    }
    if (e.target.closest(".add-custom-entry-btn")) {
      const container = e.target
        .closest(".custom-section-form")
        .querySelector(".custom-entries-list");
      addCustomEntryForm(container);
    }
  });

  // Action buttons
  clearFormBtn.addEventListener("click", clearForm);
  downloadPdfBtn.addEventListener("click", downloadPDF);
  aiSummaryBtn.addEventListener("click", getAISuggestions);

  // Skills logic
  skillsInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const skill = skillsInput.value.trim();
      if (skill) {
        if (!skills.includes(skill)) {
          skills.push(skill);
          createSkillTag(skill);
        }
        skillsInput.value = "";
        updateSkillsInput();
      }
    }
  });

  skillsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-skill-btn")) {
      const skill = e.target.parentElement.textContent.trim();
      skills = skills.filter((s) => s !== skill);
      e.target.parentElement.remove();
      updateSkillsInput();
    }
  });

  // Voice input
  document.querySelectorAll(".voice-input-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const targetInput = document.getElementById(targetId);
      startSpeechRecognition(targetInput);
    });
  });

  // --- CORE FUNCTIONS ---

  function updatePreview() {
    // Personal Info
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const linkedin = document.getElementById("linkedin").value;

    previewName.textContent = name || "Your Name";
    updateContactInfo("email", email);
    updateContactInfo("phone", phone);
    updateContactInfo("linkedin", linkedin, true);

    // Summary
    const summary = document.getElementById("summary").value;
    updateSectionVisibility("summary", summary);
    previewSummary.textContent = summary;

    // Skills
    updateSectionVisibility("skills", skills.length > 0);
    previewSkills.innerHTML = skills
      .map(
        (skill) =>
          `<span class="bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${skill}</span>`
      )
      .join("");

    // Experience
    const experienceItems = experienceList.querySelectorAll(
      ".dynamic-section-item"
    );
    updateSectionVisibility("experience", experienceItems.length > 0);
    previewExperienceList.innerHTML = Array.from(experienceItems)
      .map((item) => {
        const title = item.querySelector('[name="exp-title"]').value;
        const company = item.querySelector('[name="exp-company"]').value;
        const dates = item.querySelector('[name="exp-dates"]').value;
        const description = item.querySelector('[name="exp-desc"]').value;

        if (!title && !company && !dates && !description) return "";

        return `
                <div class="text-sm">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-semibold text-base">${
                          title || "Job Title"
                        }</h3>
                        <span class="text-xs font-medium text-slate-500">${
                          dates || "Start - End Date"
                        }</span>
                    </div>
                    <p class="text-slate-600 font-medium">${
                      company || "Company Name"
                    }</p>
                    <p class="mt-1 text-slate-700 whitespace-pre-wrap">${
                      description || "Job description..."
                    }</p>
                </div>
            `;
      })
      .join("");

    // Education
    const educationItems = educationList.querySelectorAll(
      ".dynamic-section-item"
    );
    updateSectionVisibility("education", educationItems.length > 0);
    previewEducationList.innerHTML = Array.from(educationItems)
      .map((item) => {
        const degree = item.querySelector('[name="edu-degree"]').value;
        const school = item.querySelector('[name="edu-school"]').value;
        const dates = item.querySelector('[name="edu-dates"]').value;

        if (!degree && !school && !dates) return "";

        return `
                <div class="text-sm">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-semibold text-base">${
                          degree || "Degree / Certificate"
                        }</h3>
                        <span class="text-xs font-medium text-slate-500">${
                          dates || "Start - End Date"
                        }</span>
                    </div>
                    <p class="text-slate-600 font-medium">${
                      school || "School / University"
                    }</p>
                </div>
            `;
      })
      .join("");

    // Custom Sections
    previewCustomSectionsContainer.innerHTML = "";
    const customSections = customSectionsContainer.querySelectorAll(
      ".custom-section-form"
    );
    customSections.forEach((section) => {
      const sectionTitle = section.querySelector("h3").textContent;
      const entries = section.querySelectorAll(".dynamic-section-item");
      let entriesHTML = "";

      entries.forEach((entry) => {
        const title = entry.querySelector('[name="custom-title"]').value;
        const subtitle = entry.querySelector('[name="custom-subtitle"]').value;
        const description = entry.querySelector('[name="custom-desc"]').value;
        if (title || subtitle || description) {
          entriesHTML += `
                        <div class="text-sm mt-2">
                            <div class="flex justify-between items-baseline">
                                <h3 class="font-semibold text-base">${
                                  title || "Title"
                                }</h3>
                                <span class="text-xs font-medium text-slate-500">${
                                  subtitle || "Subtitle/Date"
                                }</span>
                            </div>
                            <p class="mt-1 text-slate-700 whitespace-pre-wrap">${
                              description || "Description..."
                            }</p>
                        </div>
                    `;
        }
      });

      if (entriesHTML) {
        previewCustomSectionsContainer.innerHTML += `
                    <section class="resume-section mb-6">
                        <h2 class="text-xl font-bold border-b-2 border-slate-300 pb-1 mb-2">${sectionTitle}</h2>
                        <div class="space-y-4">${entriesHTML}</div>
                    </section>
                `;
      }
    });

    updateProgressBar();
    lucide.createIcons();
  }

  function updateContactInfo(type, value, isLink = false) {
    const container = document.getElementById(`preview-${type}-container`);
    const element = document.getElementById(`preview-${type}`);
    if (value) {
      container.classList.remove("hidden");
      container.classList.add("inline-flex");
      if (isLink) {
        element.textContent = value.replace(/^(https?:\/\/)?(www\.)?/, "");
        element.href = value.startsWith("http") ? value : `https://${value}`;
      } else {
        element.textContent = value;
      }
    } else {
      container.classList.add("hidden");
      container.classList.remove("inline-flex");
    }
  }

  function updateSectionVisibility(section, hasContent) {
    const element = document.getElementById(`preview-${section}-section`);
    if (hasContent) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  }

  function updateProgressBar() {
    let totalProgress = 0;
    const inputsForProgress = form.querySelectorAll("[data-progress]");

    inputsForProgress.forEach((input) => {
      if (input.value.trim() !== "") {
        totalProgress += parseInt(input.dataset.progress, 10);
      }
    });

    // Add progress for dynamic sections
    if (experienceList.querySelectorAll(".dynamic-section-item").length > 0)
      totalProgress += 10;
    if (educationList.querySelectorAll(".dynamic-section-item").length > 0)
      totalProgress += 10;
    if (
      customSectionsContainer.querySelectorAll(".custom-section-form").length >
      0
    )
      totalProgress += 5;

    progressBar.style.width = `${Math.min(totalProgress, 100)}%`;
  }

  function addDynamicSection(type) {
    const container = type === "experience" ? experienceList : educationList;
    const newItem = document.createElement("div");
    newItem.className =
      "dynamic-section-item p-4 border border-slate-200 rounded-lg relative";

    if (type === "experience") {
      newItem.innerHTML = `
                <button type="button" class="remove-btn absolute top-2 right-2 text-slate-400 hover:text-red-500"><i data-lucide="x-circle" class="h-5 w-5"></i></button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="exp-title" class="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="Job Title">
                    <input type="text" name="exp-company" class="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="Company Name">
                </div>
                <input type="text" name="exp-dates" class="mt-4 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="Start Date - End Date (e.g., Jan 2020 - Present)">
                <textarea name="exp-desc" rows="3" class="mt-4 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="Describe your responsibilities and achievements..."></textarea>
            `;
    } else {
      // Education
      newItem.innerHTML = `
                <button type="button" class="remove-btn absolute top-2 right-2 text-slate-400 hover:text-red-500"><i data-lucide="x-circle" class="h-5 w-5"></i></button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="edu-degree" class="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="Degree / Certificate">
                    <input type="text" name="edu-school" class="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="School / University">
                </div>
                <input type="text" name="edu-dates" class="mt-4 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="Graduation Date (e.g., May 2019)">
            `;
    }
    container.appendChild(newItem);
    lucide.createIcons();
    updatePreview();
  }

  function addCustomSectionForm() {
    const titleInput = document.getElementById("custom-section-title-input");
    const title = titleInput.value.trim();
    if (!title) {
      alert("Please enter a title for your custom section.");
      return;
    }

    const newSection = document.createElement("div");
    newSection.className =
      "custom-section-form p-4 border border-slate-200 rounded-lg";
    newSection.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold">${title}</h3>
                <button type="button" class="remove-custom-section-btn text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="h-5 w-5"></i></button>
            </div>
            <div class="custom-entries-list space-y-2"></div>
            <button type="button" class="add-custom-entry-btn mt-2 text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1">
                <i data-lucide="plus-circle" class="h-4 w-4"></i> Add Entry
            </button>
        `;
    customSectionsContainer.appendChild(newSection);
    addCustomEntryForm(newSection.querySelector(".custom-entries-list"));
    titleInput.value = "";
    lucide.createIcons();
    updatePreview();
  }

  function addCustomEntryForm(container) {
    const newItem = document.createElement("div");
    newItem.className =
      "dynamic-section-item p-3 border border-slate-100 rounded-md relative";
    newItem.innerHTML = `
            <button type="button" class="remove-btn absolute top-2 right-2 text-slate-400 hover:text-red-500"><i data-lucide="x-circle" class="h-4 w-4"></i></button>
            <input type="text" name="custom-title" class="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm mb-2" placeholder="Title (e.g., Project Name)">
            <input type="text" name="custom-subtitle" class="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm mb-2" placeholder="Subtitle (e.g., Date, Tech Stack)">
            <textarea name="custom-desc" rows="2" class="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" placeholder="Description..."></textarea>
        `;
    container.appendChild(newItem);
    lucide.createIcons();
    updatePreview();
  }

  function clearForm() {
    form.reset();
    experienceList.innerHTML = "";
    educationList.innerHTML = "";
    customSectionsContainer.innerHTML = "";
    skills = [];
    skillsContainer
      .querySelectorAll(".skill-tag")
      .forEach((tag) => tag.remove());
    updateSkillsInput();
    updatePreview();
  }

  function downloadPDF() {
    const element = document.getElementById("resume-preview");
    const opt = {
      margin: 0.5,
      filename: `${document.getElementById("name").value || "resume"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  }

  // --- SKILLS HELPER FUNCTIONS ---
  function createSkillTag(skill) {
    const tag = document.createElement("span");
    tag.className =
      "skill-tag flex items-center bg-slate-200 text-slate-800 text-sm font-medium px-2 py-1 rounded-md";
    tag.innerHTML = `${skill} <button type="button" class="remove-skill-btn ml-2 text-slate-500 hover:text-slate-800">&times;</button>`;
    skillsContainer.insertBefore(tag, skillsInput);
  }

  function updateSkillsInput() {
    hiddenSkillsInput.value = skills.join(",");
    // Manually trigger input event for live update
    hiddenSkillsInput.dispatchEvent(new Event("input", { bubbles: true }));
    updatePreview();
  }

  // --- VOICE RECOGNITION ---
  function startSpeechRecognition(targetInput) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const originalPlaceholder = targetInput.placeholder;
    targetInput.placeholder = "Listening...";
    targetInput.classList.add("bg-sky-50");

    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      targetInput.value = speechResult;
      updatePreview();
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      targetInput.placeholder = originalPlaceholder;
      targetInput.classList.remove("bg-sky-50");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      targetInput.placeholder = "Error listening. Try again.";
      setTimeout(() => (targetInput.placeholder = originalPlaceholder), 2000);
    };
  }

  // --- AI ASSISTANT ---
  async function getAISuggestions() {
    const summaryText = document.getElementById("summary").value;
    if (!summaryText.trim()) {
      alert("Please write a summary first before asking for AI suggestions.");
      return;
    }

    const loader = document.getElementById("ai-summary-loader");
    loader.classList.remove("hidden");
    aiSummaryBtn.disabled = true;

    const prompt = `You are an expert resume writer. Rewrite the following resume summary to be more professional, impactful, and ATS-friendly. Make it concise (about 3-4 sentences) and use strong action verbs. Here is the user's summary:\n\n"${summaryText}"`;

    try {
      const generatedText = await callGeminiAPI(prompt);
      if (generatedText) {
        document.getElementById("summary").value = generatedText;
        updatePreview();
      } else {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      alert(
        "Sorry, we couldn't get AI suggestions at this time. Please try again later."
      );
    } finally {
      loader.classList.add("hidden");
      aiSummaryBtn.disabled = false;
    }
  }

  async function callGeminiAPI(prompt) {
    const apiKey = ""; // Canvas will provide the key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    let response;
    let result;
    let retries = 3;
    let delay = 1000;

    for (let i = 0; i < retries; i++) {
      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        result = await response.json();

        if (
          result.candidates &&
          result.candidates.length > 0 &&
          result.candidates[0].content.parts[0].text
        ) {
          return result.candidates[0].content.parts[0].text.trim();
        } else {
          throw new Error("Invalid response structure from API.");
        }
      } catch (error) {
        console.warn(
          `API call failed, attempt ${i + 1}. Retrying in ${delay}ms...`,
          error
        );
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error; // Rethrow after final attempt
        }
      }
    }
    return null;
  }

  // --- INITIALIZATION ---
  addDynamicSection("experience"); // Add one empty experience section to start
  addDynamicSection("education"); // Add one empty education section to start
  updatePreview(); // Initial call to sync preview
});
