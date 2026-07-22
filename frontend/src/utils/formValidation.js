/**
 * Form validation helper that highlights empty required fields,
 * smoothly scrolls to the first invalid field, and shows a warning toast.
 * 
 * @param {HTMLElement|React.RefObject} containerRef - Form or modal element containing inputs
 * @param {Object} toast - Toast notification object (from useAdminDialog)
 * @returns {boolean} isValid - true if all required fields are valid, false otherwise
 */
export const validateRequiredFields = (containerRef, toast) => {
  const container = containerRef?.current || containerRef || document;
  
  // Find all required fields within container
  const requiredInputs = container.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );

  let isValid = true;
  let firstInvalid = null;

  requiredInputs.forEach((el) => {
    const val = el.value ? el.value.trim() : "";
    if (!val) {
      isValid = false;
      el.classList.add("is-invalid");
      if (!firstInvalid) {
        firstInvalid = el;
      }
      
      // Clean up invalid styling when user types
      const removeInvalid = () => {
        el.classList.remove("is-invalid");
        el.removeEventListener("input", removeInvalid);
        el.removeEventListener("change", removeInvalid);
      };
      el.addEventListener("input", removeInvalid);
      el.addEventListener("change", removeInvalid);
    } else {
      el.classList.remove("is-invalid");
    }
  });

  if (!isValid) {
    if (toast && typeof toast.warning === "function") {
      toast.warning("Please complete all required fields.");
    }
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.focus();
    }
  }

  return isValid;
};
