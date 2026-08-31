import React, { useState, useEffect, useRef } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import SEOHead from "../components/SEOHead";
import "./ConferenceHome.css";
import "./ConferenceHome.mobile.css";

const DEFAULT_PRICING_TIERS = [
  { type: "Student Registration", earlyPrice: 129, midPrice: 159, finalPrice: 189 },
  { type: "Academic Registration", earlyPrice: 99, midPrice: 129, finalPrice: 169 },
  { type: "Business Delegate", earlyPrice: 149, midPrice: 179, finalPrice: 199 }
];

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
};

const getEventEmoji = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("opens") || t.includes("start")) return "📄";
  if (t.includes("deadline") || t.includes("close")) return "📝";
  if (t.includes("acceptance") || t.includes("notification")) return "📢";
  if (t.includes("full paper") || t.includes("paper")) return "📚";
  if (t.includes("early bird") || t.includes("early")) return "💳";
  if (t.includes("regular") || t.includes("registration")) return "💰";
  if (t.includes("speaker")) return "🎤";
  if (t.includes("ceremony") || t.includes("award")) return "🏆";
  if (t.includes("certificate")) return "🎓";
  if (t.includes("proceeding") || t.includes("publication")) return "📖";
  return "📅";
};

const getGoogleCalendarUrl = (event, fallbackDateStr) => {
  const title = encodeURIComponent(event.eventTitle || event.sessionTitle || "Conference Event");
  const desc = encodeURIComponent(event.eventDescription || event.description || "");
  const baseDate = event.eventDate || fallbackDateStr || new Date().toISOString().split("T")[0];
  const dateStr = baseDate.replace(/-/g, "");
  const nextDay = new Date(baseDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split("T")[0].replace(/-/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${desc}&dates=${dateStr}/${nextDayStr}`;
};

const getOutlookCalendarUrl = (event, fallbackDateStr) => {
  const title = encodeURIComponent(event.eventTitle || event.sessionTitle || "Conference Event");
  const desc = encodeURIComponent(event.eventDescription || event.description || "");
  const baseDate = event.eventDate || fallbackDateStr || new Date().toISOString().split("T")[0];
  const start = `${baseDate}T00:00:00Z`;
  const nextDay = new Date(baseDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const end = `${nextDay.toISOString().split("T")[0]}T00:00:00Z`;
  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&body=${desc}&startdt=${start}&enddt=${end}&allday=true`;
};

const downloadIcsFile = (event, fallbackDateStr) => {
  const title = event.eventTitle || event.sessionTitle || "Conference Event";
  const desc = event.eventDescription || event.description || "";
  const baseDate = event.eventDate || fallbackDateStr || new Date().toISOString().split("T")[0];
  const dateStr = baseDate.replace(/-/g, "");
  const nextDay = new Date(baseDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split("T")[0].replace(/-/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Intelevo Research//Conference Event//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${nextDayStr}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ConferenceHome = () => {
  const { conference, getSubRoutePath } = useOutletContext();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [deadlineTimeLeft, setDeadlineTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sessions, setSessions] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [infoUpdates, setInfoUpdates] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [speakersList, setSpeakersList] = useState([]);
  const [advisoryBoard, setAdvisoryBoard] = useState([]);
  const [committee, setCommittee] = useState([]);
  const [agendaDays, setAgendaDays] = useState([]);
  const [activeAgendaDayId, setActiveAgendaDayId] = useState(null);
  const [selectedBioSpeaker, setSelectedBioSpeaker] = useState(null);
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgendaDetail, setSelectedAgendaDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllSpeakers, setShowAllSpeakers] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFilter, setGalleryFilter] = useState("ALL");
  const [lightboxImg, setLightboxImg] = useState(null);

  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const sections = document.querySelectorAll('.anim-section');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
      observer.disconnect();
    };
  }, [loading]);

  // ── MOBILE: mob-anim-section scroll-reveal observer ──────────────────────
  useEffect(() => {
    if (window.innerWidth > 768) return;
    const mobObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mob-in-view');
          mobObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const mobSections = document.querySelectorAll('.mob-anim-section');
    mobSections.forEach(el => mobObserver.observe(el));

    return () => mobObserver.disconnect();
  }, [loading]);

  // ── MOBILE: Hero slider swipe gesture ────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth > 768) return;
    const hero = document.querySelector('.conf-home-hero-slider');
    if (!hero) return;
    let startX = 0;
    const onTouchStart = (e) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        const arrows = document.querySelectorAll('.conf-slider-arrow');
        if (arrows.length >= 2) {
          diff > 0 ? arrows[1].click() : arrows[0].click();
        }
      }
    };
    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      hero.removeEventListener('touchstart', onTouchStart);
      hero.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // ── MOBILE: Ripple effect on buttons ─────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth > 768) return;
    const addRipple = (e) => {
      const btn = e.currentTarget;
      const circle = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.cssText = `
        position:absolute;border-radius:50%;
        width:${size}px;height:${size}px;
        top:${e.clientY - rect.top - size / 2}px;
        left:${e.clientX - rect.left - size / 2}px;
        background:rgba(255,255,255,0.3);
        transform:scale(0);pointer-events:none;
        animation:mob-ripple 0.55s linear forwards;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    };

    const style = document.createElement('style');
    style.textContent = `@keyframes mob-ripple{0%{transform:scale(0);opacity:0.6}100%{transform:scale(4);opacity:0}}`;
    document.head.appendChild(style);

    const btns = document.querySelectorAll('.btn-conf-submit, .btn-conf-download, .btn-hero-primary, .btn-hero-secondary');
    btns.forEach(btn => btn.addEventListener('click', addRipple));
    return () => {
      btns.forEach(btn => btn.removeEventListener('click', addRipple));
      style.remove();
    };
  }, [loading]);



const getEventStatus = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate.getTime() === today.getTime()) {
      return "today";
    } else if (eventDate.getTime() < today.getTime()) {
      return "completed";
    } else {
      return "upcoming";
    }
  };

  useEffect(() => {
    const rawDates = conference.importantDates || [];
    const activeDates = rawDates
      .filter(d => d.isActive)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDates = activeDates.filter(d => {
      const eventDate = new Date(d.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });

    const nextDeadline = upcomingDates[0];
    if (!nextDeadline) {
      setDeadlineTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const targetDate = new Date(`${nextDeadline.eventDate}T23:59:59`);

    const updateTimer = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference <= 0) {
        setDeadlineTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setDeadlineTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [conference.importantDates]);

  // Background Slider & Date Formatter
  const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/uploads/conference/${url}`;
  };
  let rawHeroImages = conference.images && conference.images.length > 0
    ? conference.images.filter(Boolean)
    : [];
  
  if (rawHeroImages.length === 0) {
    rawHeroImages = conference.image 
      ? [conference.image] 
      : ["https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80"];
  }

  const heroImages = rawHeroImages.map(formatImageUrl).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState([0]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (!loadedSlides.includes(activeIndex)) {
      setLoadedSlides((prev) => [...prev, activeIndex]);
    }
  }, [activeIndex, loadedSlides]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % heroImages.length);
  };
  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const formatDateRangeAndLocation = () => {
    if (!conference.startDate || !conference.endDate) {
      return { formattedDate: conference.date || "", venue: conference.venue || "" };
    }
    try {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const startParts = conference.startDate.split('-');
      const endParts = conference.endDate.split('-');

      if (startParts.length === 3 && endParts.length === 3) {
        const startYear = startParts[0];
        const startMonth = months[parseInt(startParts[1]) - 1];
        const startDay = parseInt(startParts[2]);

        const endYear = endParts[0];
        const endMonth = months[parseInt(endParts[1]) - 1];
        const endDay = parseInt(endParts[2]);

        let formattedDate = "";
        if (startYear === endYear) {
          if (startMonth === endMonth) {
            if (startDay === endDay) {
              formattedDate = `${startMonth} ${startDay}, ${startYear}`;
            } else {
              formattedDate = `${startMonth} ${startDay}–${endDay}, ${startYear}`;
            }
          } else {
            formattedDate = `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
          }
        } else {
          formattedDate = `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
        }

        return {
          formattedDate,
          venue: conference.venue
        };
      }
    } catch (e) {
      console.error("Error formatting date range:", e);
    }
    return { formattedDate: conference.date || "", venue: conference.venue || "" };
  };

  const { formattedDate, venue } = formatDateRangeAndLocation();

  const getDayDateString = (dayNumber) => {
    if (!conference.startDate) return "";
    try {
      const start = new Date(conference.startDate);
      start.setDate(start.getDate() + (dayNumber - 1));
      return start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return "";
    }
  };

  const getDayTabTitle = (d) => {
    if (!conference.startDate) return `DAY ${d.dayNumber}`;
    try {
      const start = new Date(conference.startDate);
      start.setDate(start.getDate() + (d.dayNumber - 1));
      const monthStr = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      const dayStr = start.toLocaleDateString("en-US", { day: "2-digit" });
      return `DAY ${d.dayNumber} - ${monthStr} ${dayStr}`;
    } catch (e) {
      return `DAY ${d.dayNumber}`;
    }
  };

  const getSessionTypeBadgeStyle = (type) => {
    switch (type) {
      case "Keynote":
      case "Keynote Session":
        return { bg: "#fef08a", color: "#854d0e" };
      case "Break":
      case "Lunch":
      case "Tea Break":
        return { bg: "#f1f5f9", color: "#475569" };
      case "Technical Session":
      case "Oral Presentation":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "Poster Session":
        return { bg: "#fce7f3", color: "#9d174d" };
      case "Workshop":
        return { bg: "#dcfce3", color: "#166534" };
      case "Panel Discussion":
        return { bg: "#fae8ff", color: "#86198f" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const getActivePhase = () => {
    if (!conference.startDate) return "Early Bird";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseLocalDate(conference.startDate);

    const earlyDeadline = new Date(start);
    earlyDeadline.setDate(earlyDeadline.getDate() - 45);
    earlyDeadline.setHours(0, 0, 0, 0);

    const midDeadline = new Date(start);
    midDeadline.setDate(midDeadline.getDate() - 20);
    midDeadline.setHours(0, 0, 0, 0);

    if (today <= earlyDeadline) {
      return "Early Bird";
    } else if (today <= midDeadline) {
      return "Mid-On";
    } else {
      return "Final";
    }
  };

  const activePhase = getActivePhase();

  const baseTiers = conference.pricingTiers && conference.pricingTiers.length > 0
    ? conference.pricingTiers
    : DEFAULT_PRICING_TIERS;

  // Resolve prices for the three ticket cards
  const getTicketPrice = (category) => {
    const dbTiers = conference.pricingTiers || [];
    let tier;

    if (category === "students") {
      // Find "academic" in DB, fallback to Academic Registration default tier (index 1)
      tier = dbTiers.find(t => t.type.toLowerCase().includes("academic")) || DEFAULT_PRICING_TIERS[1];
    } else if (category === "speaker") {
      // Find "student" in DB, fallback to Student Registration default tier (index 0)
      tier = dbTiers.find(t => t.type.toLowerCase().includes("student") || t.type.toLowerCase().includes("speaker")) || DEFAULT_PRICING_TIERS[0];
    } else {
      // Find "delegate" or "business" in DB, fallback to Business Delegate default tier (index 2)
      tier = dbTiers.find(t => t.type.toLowerCase().includes("delegate") || t.type.toLowerCase().includes("business")) || DEFAULT_PRICING_TIERS[2];
    }

    if (!tier) return 0;
    if (activePhase === "Early Bird") return tier.earlyPrice;
    if (activePhase === "Mid-On") return tier.midPrice;
    return tier.finalPrice;
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(conference.countdownTarget);
      const difference = +target - +new Date();
      let time = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        time = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return time;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [conference.countdownTarget]);

  // Fetch dynamic sessions, sections & info updates
  useEffect(() => {
    if (!conference || !conference.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          sessionsData,
          sectionsData,
          infoData,
          tracksData,
          sponsorsData,
          speakersData,
          boardData,
          committeeData,
          agendaData,
          galleryData
        ] = await Promise.all([
          api.get(`/api/sessions?conferenceId=${conference.id}`).catch(() => []),
          api.get(`/api/conference-sections?conferenceId=${conference.id}`).catch(() => []),
          api.get("/api/info-updates").catch(() => []),
          api.get(`/api/tracks?conferenceId=${conference.id}`).catch(() => []),
          api.get(`/api/sponsors?conferenceId=${conference.id}`).catch(() => []),
          api.get(`/api/speakers?conferenceId=${conference.id}`).catch(() => []),
          api.get(`/api/advisory-board?conferenceId=${conference.id}`).catch(() => []),
          api.get(`/api/committee?conferenceId=${conference.id}`).catch(() => []),
          api.get(`/api/agenda/days?conferenceId=${conference.id}`).catch(() => []),
          api.get(`/api/gallery?conferenceId=${conference.id}`).catch(() => [])
        ]);
        if (Array.isArray(sessionsData)) {
          setSessions(sessionsData);
        }
        if (Array.isArray(sectionsData)) {
          setSections(sectionsData);
          if (sectionsData.length > 0) {
            setActiveTab(sectionsData[0].sectionSlug);
            setActiveSection(sectionsData[0]);
          }
        }
        if (Array.isArray(infoData)) {
          setInfoUpdates(infoData);
        }
        if (Array.isArray(tracksData)) {
          setTracks(tracksData.filter(t => t.enabled !== false && t.isEnabled !== false));
        }
        if (Array.isArray(sponsorsData)) {
          setSponsors(sponsorsData);
        }
        if (Array.isArray(speakersData)) {
          setSpeakersList(speakersData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        }
        if (Array.isArray(boardData)) {
          setAdvisoryBoard(boardData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        }
        if (Array.isArray(committeeData)) {
          setCommittee(committeeData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        }
        if (Array.isArray(agendaData)) {
          const sortedDays = agendaData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setAgendaDays(sortedDays);
          if (sortedDays.length > 0) {
            setActiveAgendaDayId(sortedDays[0].id);
          }
        }
        if (Array.isArray(galleryData)) {
          setGalleryImages(galleryData);
        }
      } catch (err) {
        console.error("Failed to load home page dynamic details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conference.id]);

  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let autoScrollInterval = null;
    let isInteracting = false;
    let userTimeout = null;

    const updateCardTransforms = () => {
      if (window.innerWidth > 768) {
        const cards = container.querySelectorAll(".info-update-card");
        cards.forEach((card) => {
          card.style.transform = "";
          card.style.opacity = "";
          card.style.transition = "";
        });
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      const cards = container.querySelectorAll(".info-update-card");

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = cardCenter - containerCenter;

        // Normalize distance based on half-width of container
        const normalizedDistance = distance / (containerRect.width / 2 || 1);
        const clampedDistance = Math.max(-1.5, Math.min(1.5, normalizedDistance));

        // Scale: shrink slightly as card moves away from center
        const scale = 1 - Math.abs(clampedDistance) * 0.12;

        // Rotation: 3D coverflow style rotation
        const rotateY = clampedDistance * -15;

        // Translation: translateY pushes down at edges to create a downward scroll curve
        const translateY = Math.abs(clampedDistance) * Math.abs(clampedDistance) * 15;

        // Opacity: fade out slightly towards the edges
        const opacity = 1 - Math.abs(clampedDistance) * 0.25;

        card.style.transform = `perspective(800px) translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`;
        card.style.opacity = opacity;
        card.style.transition = "transform 0.1s ease-out, opacity 0.1s ease-out";
      });
    };

    const startAutoScroll = () => {
      if (window.innerWidth > 768) return;
      stopAutoScroll();
      autoScrollInterval = setInterval(() => {
        if (isInteracting) return;

        const cards = container.querySelectorAll(".info-update-card");
        if (cards.length <= 1) return;

        const cardRect = cards[0].getBoundingClientRect();
        const cardWidth = cardRect.width + 20; // card width + 20px gap
        const currentScroll = container.scrollLeft;
        const totalWidth = container.scrollWidth;
        const maxScroll = totalWidth - container.clientWidth;

        let nextScroll = currentScroll + cardWidth;
        // If we reach the end, wrap back to the beginning
        if (nextScroll >= maxScroll + 10) {
          nextScroll = 0;
        }

        container.scrollTo({
          left: nextScroll,
          behavior: "smooth"
        });
      }, 3000);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    };

    const handleInteraction = () => {
      isInteracting = true;
      stopAutoScroll();
      clearTimeout(userTimeout);
      userTimeout = setTimeout(() => {
        isInteracting = false;
        startAutoScroll();
      }, 5000); // Resume auto scroll after 5 seconds of inactivity
    };

    const timer = setTimeout(updateCardTransforms, 100);

    container.addEventListener("scroll", updateCardTransforms);
    container.addEventListener("touchstart", handleInteraction, { passive: true });
    container.addEventListener("mousedown", handleInteraction);
    window.addEventListener("resize", updateCardTransforms);

    startAutoScroll();

    return () => {
      clearTimeout(timer);
      clearTimeout(userTimeout);
      stopAutoScroll();
      if (container) {
        container.removeEventListener("scroll", updateCardTransforms);
        container.removeEventListener("touchstart", handleInteraction);
        container.removeEventListener("mousedown", handleInteraction);
      }
      window.removeEventListener("resize", updateCardTransforms);
    };
  }, [infoUpdates, loading]);

  // Format single digits with leading zero
  const formatNum = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  // Mock fallbacks if database is empty
  const mockSpeakers = [
    {
      id: "mock-1",
      name: "Prof. Sarah Higgins",
      designation: "Scientific Committee Chair",
      affiliation: "University of Oxford",
      country: "UK",
      type: "ADVISORY_BOARD",
      bio: "Prof. Higgins is a leading scholar in biochemical adaptation and has published over 120 papers in highly-indexed journals.",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "mock-2",
      name: "Dr. Kenji Sato",
      designation: "Plenary Chair",
      affiliation: "Tokyo Institute of Technology",
      country: "Japan",
      type: "ADVISORY_BOARD",
      bio: "Dr. Sato specializes in nanotechnology integrations and has collaborated on several international research projects.",
      photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "mock-3",
      name: "Dr. Andrea Miller",
      designation: "Invited Keynote Presenter",
      affiliation: "University of Valencia",
      country: "Spain",
      type: "KEYNOTE",
      bio: "Dr. Miller's research centers on international adaptation models and sustainable agricultural systems.",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "mock-4",
      name: "Prof. Alan Vance",
      designation: "Technical Lead",
      affiliation: "CERN Particle Accelerator",
      country: "Switzerland",
      type: "KEYNOTE",
      bio: "Prof. Vance is an experimental physicist coordinating major detector validation campaigns globally.",
      photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80"
    }
  ];

  // Resolve which lists to display
  const activeSessions = sessions.length > 0
    ? sessions.map(s => ({ title: s.name, desc: s.description }))
    : (conference.sessions || []);

  const currentItems = activeSection ? (activeSection.items || []) : [];

  const renderAboutText = (text) => {
    if (!text) return null;
    return text.split(/\n+/).map((para, idx) => (
      <p key={idx} className="conf-about-para" style={{ whiteSpace: "pre-line", marginBottom: "15px", fontSize: "15.5px", lineHeight: "1.6", color: "#4a5568" }}>
        {para.trim()}
      </p>
    ));
  };

  const eventStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": conference?.title || "International Conference",
    "description": conference?.about || `Join global leaders and researchers at ${conference?.title || 'our international conference'}.`,
    "startDate": conference?.startDate,
    "endDate": conference?.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": conference?.venue || "Conference Center",
      "address": conference?.venue || "International Venue"
    },
    "image": conference?.image,
    "organizer": {
      "@type": "Organization",
      "name": "Intelevo Research",
      "url": "https://intelevoresearch.com"
    }
  };

  return (
    <div className="conf-home-portal max-w-[100vw] overflow-x-hidden">
      <SEOHead
        title={`${conference?.title || "International Conference"} | Intelevo Research`}
        description={conference?.about || `Join global researchers, academicians, and industry experts at ${conference?.title || "our conference"}.`}
        keywords={`${conference?.title || ""}, international conference, research paper, abstract submission, ${conference?.venue || ""}`}
        ogTitle={conference?.title}
        ogDescription={conference?.about}
        ogImage={conference?.image}
        structuredData={eventStructuredData}
      />
      {/* Hero Section */}
      <section className="conf-home-hero anim-section mob-anim-section max-md:min-h-[100svh]">
        <div className="conf-home-hero-slider">
          {heroImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`conf-home-hero-slide ${idx === activeIndex ? 'active' : ''}`}
              style={{
                backgroundImage: loadedSlides.includes(idx) ? `url("${imgUrl}")` : 'none'
              }}
            />
          ))}
        </div>

        {heroImages.length > 1 && (
          <>
            <button className="conf-slider-arrow prev" onClick={prevSlide}>
              &#10094;
            </button>
            <button className="conf-slider-arrow next" onClick={nextSlide}>
              &#10095;
            </button>
            <div className="conf-slider-dots">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`conf-slider-dot ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                />
              ))}
            </div>
          </>
        )}

        <div className="conf-home-hero-content max-md:px-4">
          <h1 className="max-md:text-4xl max-md:mb-4">{conference.title}</h1>
          <div className="conf-home-hero-meta max-md:flex max-md:flex-col max-md:gap-2 max-md:p-3 max-md:bg-black/40 max-md:rounded-lg">
            <span className="conf-meta-item max-md:text-sm">
              <span className="meta-icon">📅</span> {formattedDate}
            </span>
            <span className="conf-meta-separator max-md:hidden"> @ </span>
            <span className="conf-meta-item max-md:text-sm max-md:text-center">
              <span className="meta-icon">📍</span> {venue}
            </span>
          </div>
          {/* Countdown circles */}
          <div className="conf-countdown max-md:flex max-md:flex-wrap max-md:justify-center max-md:gap-3 max-md:mt-6">
            <div className="conf-countdown-item max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:w-20 max-md:h-20 max-md:border-2 max-md:border-rose-500 max-md:rounded-full max-md:bg-black/50 max-md:backdrop-blur-sm max-md:shadow-lg">
              <span className="conf-countdown-number max-md:text-2xl">{formatNum(timeLeft.days)}</span>
              <span className="conf-countdown-label max-md:text-[10px]">Days</span>
            </div>
            <div className="conf-countdown-item max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:w-20 max-md:h-20 max-md:border-2 max-md:border-rose-500 max-md:rounded-full max-md:bg-black/50 max-md:backdrop-blur-sm max-md:shadow-lg">
              <span className="conf-countdown-number max-md:text-2xl">{formatNum(timeLeft.hours)}</span>
              <span className="conf-countdown-label max-md:text-[10px]">Hours</span>
            </div>
            <div className="conf-countdown-item max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:w-20 max-md:h-20 max-md:border-2 max-md:border-rose-500 max-md:rounded-full max-md:bg-black/50 max-md:backdrop-blur-sm max-md:shadow-lg">
              <span className="conf-countdown-number max-md:text-2xl">{formatNum(timeLeft.minutes)}</span>
              <span className="conf-countdown-label max-md:text-[10px]">Mins</span>
            </div>
            <div className="conf-countdown-item max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:w-20 max-md:h-20 max-md:border-2 max-md:border-rose-500 max-md:rounded-full max-md:bg-black/50 max-md:backdrop-blur-sm max-md:shadow-lg">
              <span className="conf-countdown-number max-md:text-2xl">{formatNum(timeLeft.seconds)}</span>
              <span className="conf-countdown-label max-md:text-[10px]">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="conf-about-section anim-section mob-anim-section bg-white px-4 md:px-0 py-12 md:py-20 max-md:py-12">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center max-md:grid-cols-1 max-md:px-4">
          <div className="conf-about-text">
            <h2 style={{ fontSize: "32px", color: "#0f172a", fontWeight: "800", marginBottom: "25px", position: "relative", display: "inline-block" }}>
              About the Congress
              <span style={{ display: "block", width: "60px", height: "4px", backgroundColor: "var(--conf-primary)", marginTop: "8px", borderRadius: "2px" }}></span>
            </h2>

            <div style={{ marginBottom: "20px" }}>
              {renderAboutText(conference.about)}
            </div>

            {/* Custom UI Highlights Grid */}
            <div className="conf-about-highlights grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-8 max-md:grid-cols-1 max-md:gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "35px" }}>
              <div className="conf-highlight-card p-6 bg-rose-50/50 border-l-4 border-rose-500 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" style={{ padding: "24px", background: "var(--conf-bg-accent, rgba(231, 76, 60, 0.04))", borderLeft: "4px solid var(--conf-primary)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div className="text-3xl mb-3" style={{ fontSize: "28px", marginBottom: "12px" }}>🔬</div>
                <h4 className="m-0 mb-2 text-[17px] font-bold text-slate-800" style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>Scientific tracks</h4>
                <p className="m-0 text-[13.5px] text-slate-500 leading-relaxed" style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>Deep dive into state-of-the-art presentations and panel reviews.</p>
              </div>

              <div className="conf-highlight-card p-6 bg-rose-50/50 border-l-4 border-rose-500 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" style={{ padding: "24px", background: "var(--conf-bg-accent, rgba(231, 76, 60, 0.04))", borderLeft: "4px solid var(--conf-primary)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div className="text-3xl mb-3" style={{ fontSize: "28px", marginBottom: "12px" }}>🌐</div>
                <h4 className="m-0 mb-2 text-[17px] font-bold text-slate-800" style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>Global Reach</h4>
                <p className="m-0 text-[13.5px] text-slate-500 leading-relaxed" style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>Connect and collaborate with leading minds from 50+ countries.</p>
              </div>

              <div className="conf-highlight-card p-6 bg-rose-50/50 border-l-4 border-rose-500 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" style={{ padding: "24px", background: "var(--conf-bg-accent, rgba(231, 76, 60, 0.04))", borderLeft: "4px solid var(--conf-primary)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div className="text-3xl mb-3" style={{ fontSize: "28px", marginBottom: "12px" }}>🏆</div>
                <h4 className="m-0 mb-2 text-[17px] font-bold text-slate-800" style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>Opportunities</h4>
                <p className="m-0 text-[13.5px] text-slate-500 leading-relaxed" style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>Fast-tracked indexed journal publications and oral presentation slots.</p>
              </div>
            </div>
          </div>
          <div className="conf-about-image" style={{ alignSelf: "start", marginTop: "15px" }}>
            <img
              src={
                conference.aboutImage
                  ? (conference.aboutImage.startsWith('http') ? conference.aboutImage : `${BASE_URL}/uploads/conference/${conference.aboutImage}`)
                  : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
              }
              alt="About the Congress"
              style={{ width: "100%", borderRadius: "12px", boxShadow: "0 15px 40px rgba(15, 23, 42, 0.08)" }}
            />
          </div>
        </div>
      </section>

      {/* Scientific Sessions Grid */}
      {(() => {
        if (!tracks || tracks.length === 0) {
          return null;
        }

        const tracksList = tracks.map(t => t.name);

        const midPoint = Math.ceil(tracksList.length / 2);
        const leftColumnTracks = tracksList.slice(0, midPoint);
        const rightColumnTracks = tracksList.slice(midPoint);

        return (
          <section className="conf-sessions-section anim-section mob-anim-section" style={{ padding: "60px 0", backgroundColor: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
              <div className="conf-section-header text-left" style={{ marginBottom: "35px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "15px", textTransform: "none" }}>
                  Scientific Tracks & Sessions
                </h2>
                <p style={{ color: "#334155", fontSize: "16px", lineHeight: "1.6", maxWidth: "100%", margin: "0" }}>
                  We have enlisted some outstanding sessions that will give an opportunity to focus on specific areas from your own perspective experiences. All the related interest areas are accepted, but are not limited to the following sessions:
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {leftColumnTracks.map((track, index) => (
                    <Link 
                      key={index}
                      to={getSubRoutePath ? getSubRoutePath("tracks") : "tracks"} 
                      style={{
                        display: "block",
                        backgroundColor: "#e2e8f0",
                        padding: "12px 16px",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#0f172a",
                        textDecoration: "none",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#cbd5e1";
                        e.currentTarget.style.color = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#e2e8f0";
                        e.currentTarget.style.color = "#0f172a";
                      }}
                    >
                      {track}
                    </Link>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {rightColumnTracks.map((track, index) => (
                    <Link 
                      key={index}
                      to={getSubRoutePath ? getSubRoutePath("tracks") : "tracks"} 
                      style={{
                        display: "block",
                        backgroundColor: "#e2e8f0",
                        padding: "12px 16px",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#0f172a",
                        textDecoration: "none",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#cbd5e1";
                        e.currentTarget.style.color = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#e2e8f0";
                        e.currentTarget.style.color = "#0f172a";
                      }}
                    >
                      {track}
                    </Link>
                  ))}
                </div>

              </div>
              <div style={{ marginTop: "35px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <Link to={getSubRoutePath ? getSubRoutePath("register") : "register"} className="btn-conf-submit" style={{ textDecoration: "none", display: "inline-block" }}>Register Now</Link>
                <Link to={getSubRoutePath ? getSubRoutePath("submit-abstract") : "submit-abstract"} className="btn-conf-download" style={{ textDecoration: "none", display: "inline-block" }}>Submit Abstract</Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Important Dates Section */}
      {(() => {
        const rawDates = conference.importantDates || [];
        const activeDates = rawDates
          .filter(d => d.isActive)
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        if (activeDates.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingDates = activeDates.filter(d => {
          const eventDate = new Date(d.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        const nextDeadline = upcomingDates[0];

        return (
          <section className="conf-important-dates-section anim-section mob-anim-section" id="important-dates">
            <div className="container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
              <div className="conf-section-header" style={{ textAlign: "center", marginBottom: "45px" }}>
                <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "15px" }}>
                  Important Dates
                </h2>
                <p style={{ color: "#475569", fontSize: "16px", maxWidth: "700px", margin: "0 auto" }}>
                  Stay informed about all important conference milestones and deadlines.
                </p>
              </div>

              {/* Timeline List */}
              <div className="flex flex-col gap-2 w-full max-w-4xl mx-auto">
                {activeDates.map((item, idx) => {
                  const status = getEventStatus(item.eventDate);
                  const formattedDate = new Date(item.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <div
                      key={item.id || idx}
                      className={`timeline-row ${status} ${item.isHighlighted ? 'highlighted' : ''} !flex !flex-col !w-full !rounded-[10px] !bg-white !border !border-slate-200 hover:!border-slate-300 shadow-sm transition-all duration-200`}
                    >
                      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !w-full !px-5 !py-3 !gap-2 sm:!gap-0">
                        {/* Icon & Title */}
                        <div className="!flex !items-center !gap-4 !flex-1 !min-w-0">
                          <span className="event-emoji !text-[18px] !shrink-0 !opacity-90">{getEventEmoji(item.eventTitle)}</span>
                          <h4 className="event-title !text-[15px] !font-medium !text-slate-800 !truncate !m-0">{item.eventTitle}</h4>
                        </div>
                        
                        {/* Date & Status */}
                        <div className="!flex !items-center !justify-between sm:!justify-end !w-full sm:!w-auto !gap-6 !shrink-0 !pl-10 sm:!pl-0">
                          <div className="event-date-display !font-medium !text-slate-500 !text-[14px] !w-auto sm:!w-[130px] sm:!text-right">{formattedDate}</div>
                          <div className="status-badge-container !flex !items-center !w-auto sm:!w-[90px] !justify-end">
                            {status === 'completed' && (
                              <span className="!flex !items-center !gap-1.5 !text-slate-400 !font-medium !text-[13px]">
                                ✓ Completed
                              </span>
                            )}
                            {status === 'today' && (
                              <span className="!flex !items-center !gap-1.5 !text-blue-600 !font-medium !text-[13px]">
                                ● Today
                              </span>
                            )}
                            {status === 'upcoming' && (
                              <span className="!text-slate-500 !font-medium !text-[13px]">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Calendar Export for the last active event */}
                      {idx === activeDates.length - 1 && status !== 'completed' && (
                        <div className="!flex !justify-end !gap-2 !px-5 !pb-3 !pt-2 !border-t !border-slate-50 !mt-1">
                          <button
                            onClick={() => window.open(getGoogleCalendarUrl(item), '_blank')}
                            title="Add to Google Calendar"
                            className="cal-btn google !text-[12px] !font-medium !px-3 !py-1.5 !rounded-md !bg-slate-50 !text-slate-600 hover:!bg-slate-100 !border !border-slate-200 transition-colors"
                          >
                            Google
                          </button>
                          <button
                            onClick={() => window.open(getOutlookCalendarUrl(item), '_blank')}
                            title="Add to Outlook Calendar"
                            className="cal-btn outlook !text-[12px] !font-medium !px-3 !py-1.5 !rounded-md !bg-slate-50 !text-slate-600 hover:!bg-slate-100 !border !border-slate-200 transition-colors"
                          >
                            Outlook
                          </button>
                          <button
                            onClick={() => downloadIcsFile(item)}
                            title="Download .ics Calendar Event"
                            className="cal-btn ics !text-[12px] !font-medium !px-3 !py-1.5 !rounded-md !bg-slate-50 !text-slate-600 hover:!bg-slate-100 !border !border-slate-200 transition-colors"
                          >
                            iCal
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Print action helper */}
              <div style={{ textAlign: "right", marginTop: "24px" }} className="no-print">
                <button
                  onClick={() => window.print()}
                  style={{
                    background: "none",
                    border: "1px solid #cbd5e1",
                    color: "#64748b",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  🖨️ Print Important Dates
                </button>
              </div>
            </div>
          </section>
        );
      })()}

      {/* 1. Keynote & Invited Speakers Section */}
      {/* 2. International Advisory Board Section */}
      <section className="conf-advisory-section-redesigned anim-section mob-anim-section" id="advisory-board">
        <div className="container">
          <div className="conf-section-header">
            <span className="sponsors-tag-pill">Academic Guidance</span>
            <h2>International Advisory Board</h2>
            <p style={{ color: "#718096", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
              Our distinguished advisory board members provide academic guidance and strategic direction.
            </p>
          </div>

          {advisoryBoard && advisoryBoard.filter(m => m.isActive !== false).length > 0 ? (
            <div className="conf-advisory-grid-redesigned max-md:grid max-md:grid-cols-1 max-lg:grid-cols-2 max-md:gap-4">
              {advisoryBoard.filter(m => m.isActive !== false).map((member) => (
                <div key={member.id} className="advisory-card-premium">
                  <div 
                    className="advisory-avatar-wrap-premium"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedBioSpeaker({
                        name: member.name,
                        designation: member.designation,
                        org: `${member.organization}${member.country ? ', ' + member.country : ''}`,
                        photoUrl: member.imagePath ? (member.imagePath.startsWith('http') ? member.imagePath : `${BASE_URL}${member.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg",
                        bio: member.bio || member.description || "Biography details are currently pending publication.",
                        research: member.researchExpertise
                      });
                    }}
                  >
                    <img
                      src={member.imagePath ? (member.imagePath.startsWith('http') ? member.imagePath : `${BASE_URL}${member.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg"}
                      alt={member.name}
                      onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }}
                    />
                  </div>
                  <div className="advisory-info-premium">
                    <h3
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedBioSpeaker({
                          name: member.name,
                          designation: member.designation,
                          org: `${member.organization}${member.country ? ', ' + member.country : ''}`,
                          photoUrl: member.imagePath ? (member.imagePath.startsWith('http') ? member.imagePath : `${BASE_URL}${member.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg",
                          bio: member.bio || member.description || "Biography details are currently pending publication.",
                          research: member.researchExpertise
                        });
                      }}
                    >
                      {member.name}
                    </h3>
                    <p className="advisory-role-premium">{member.designation}</p>
                    <p className="advisory-org-premium">{member.organization}{member.country ? `, ${member.country}` : ''}</p>
                    {member.researchExpertise && (
                      <div className="advisory-expertise-premium">
                        <strong>Expertise:</strong> {member.researchExpertise}
                      </div>
                    )}
                    <button type="button" className="btn-read-bio-sm-premium" onClick={() => setSelectedBioSpeaker({
                      name: member.name,
                      designation: member.designation,
                      org: `${member.organization}${member.country ? ', ' + member.country : ''}`,
                      photoUrl: member.imagePath ? (member.imagePath.startsWith('http') ? member.imagePath : `${BASE_URL}${member.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg",
                      bio: member.bio || member.description || "Biography details are currently pending publication.",
                      research: member.researchExpertise
                    })}>
                      Read Biography
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <h3 style={{ fontSize: "20px", color: "#334155", marginBottom: "12px" }}>Advisory Board to be Announced</h3>
              <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto" }}>The advisory board members are currently being finalized. Please check back later.</p>
            </div>
          )}
        </div>
      </section>

      <section className="conf-speakers-section anim-section mob-anim-section" id="keynote-speakers">
        <div className="container">
          <div className="conf-section-header">
            <span className="sponsors-tag-pill">Presentations</span>
            <h2>Keynote & Invited Speakers</h2>
            <p style={{ color: "#718096", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
              Meet the internationally recognized experts presenting at the conference.
            </p>
          </div>

          {speakersList && speakersList.filter(s => s.isActive !== false).length > 0 ? (
            <>
              <div className="conf-speakers-grid-redesigned max-md:grid max-md:grid-cols-1 max-lg:grid-cols-2 max-md:gap-4">
                {(showAllSpeakers ? speakersList.filter(s => s.isActive !== false) : speakersList.filter(s => s.isActive !== false).slice(0, 8)).map((spk) => (
                  <div key={spk.id} className={`conf-speaker-card-premium ${spk.isFeatured ? 'featured-card' : ''}`}>
                    <div 
                      className="speaker-image-wrapper-premium"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedBioSpeaker({
                        name: `${spk.academicTitle && !spk.name.trim().startsWith(spk.academicTitle.trim()) ? spk.academicTitle + ' ' : ''}${spk.name}`,
                        designation: spk.designation,
                        org: `${spk.affiliation}, ${spk.country}`,
                        photoUrl: spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : (spk.photo?.filePath || "https://randomuser.me/api/portraits/men/32.jpg"),
                        bio: spk.bio,
                        linkedin: spk.linkedin,
                        orcid: spk.orcid,
                        website: spk.website,
                        research: spk.researchAreas
                      })}
                    >
                      <img
                        src={spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : (spk.photo?.filePath || "https://randomuser.me/api/portraits/men/32.jpg")}
                        alt={spk.name}
                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }}
                      />
                      {spk.isFeatured && <span className="featured-card-badge">Featured</span>}
                    </div>
                    <div className="speaker-info-premium">
                      <h3>{spk.academicTitle && !spk.name.trim().startsWith(spk.academicTitle.trim()) ? `${spk.academicTitle} ` : ''}{spk.name}</h3>
                      <p className="speaker-designation-premium">{spk.designation}</p>
                      <p className="speaker-org-premium">{spk.affiliation}, {spk.country}</p>
                      {spk.researchAreas && (
                        <div className="speaker-research-areas-premium">
                          {spk.researchAreas.split(',').map((area, aIdx) => (
                            <span key={aIdx} className="research-pill-premium">{area.trim()}</span>
                          ))}
                        </div>
                      )}


                      <button type="button" className="btn-read-bio-premium min-h-[48px] flex items-center justify-center" onClick={() => setSelectedBioSpeaker({
                        name: `${spk.academicTitle && !spk.name.trim().startsWith(spk.academicTitle.trim()) ? spk.academicTitle + ' ' : ''}${spk.name}`,
                        designation: spk.designation,
                        org: `${spk.affiliation}, ${spk.country}`,
                        photoUrl: spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : (spk.photo?.filePath || "https://randomuser.me/api/portraits/men/32.jpg"),
                        bio: spk.bio,
                        linkedin: spk.linkedin,
                        orcid: spk.orcid,
                        website: spk.website,
                        research: spk.researchAreas
                      })}>
                        View Profile & Bio →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {speakersList.filter(s => s.isActive !== false).length > 8 && (
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                  <button
                    onClick={() => setShowAllSpeakers(!showAllSpeakers)}
                    className="btn-print-program-premium min-h-[48px] flex items-center justify-center"
                    style={{ padding: "0 30px", fontSize: "14px", display: "inline-flex" }}
                  >
                    {showAllSpeakers ? "View Less" : "View All Speakers"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <h3 style={{ fontSize: "20px", color: "#334155", marginBottom: "12px" }}>Speakers to be Announced</h3>
              <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto" }}>We are currently curating an exceptional lineup of experts and keynote speakers for this conference. Please check back soon for updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Organizing Committee Section */}
      {conference.showCommittee !== false && (
      <section className="conf-committee-section-redesigned anim-section mob-anim-section" id="organizing-committee">
        <div className="container">
          <div className="conf-section-header">
            <span className="sponsors-tag-pill">Committee</span>
            <h2>Organizing Committee</h2>
            <p style={{ color: "#718096", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
              Meet the coordinators, track chairs, and reviewers organizing the event.
            </p>
          </div>

          {committee && committee.filter(c => c.isActive !== false).length > 0 ? (
            <div className="conf-advisory-grid-redesigned max-md:grid max-md:grid-cols-1 max-lg:grid-cols-2 max-md:gap-4">
              {(() => {
                const roleOrder = [
                  "Chair",
                  "Co-Chair",
                  "Conference Secretary",
                  "Scientific Committee",
                  "Technical Committee",
                  "Publication Committee",
                  "Registration Committee",
                  "Finance Committee",
                  "Local Organizing Committee"
                ];

                const getRoleRank = (role) => {
                  const idx = roleOrder.indexOf(role);
                  return idx === -1 ? 999 : idx;
                };

                return [...committee.filter(c => c.isActive !== false)]
                  .sort((a, b) => getRoleRank(a.role || "Local Organizing Committee") - getRoleRank(b.role || "Local Organizing Committee"))
                  .map((cm) => (
                    <div key={cm.id} className="advisory-card-premium">
                      <div className="advisory-avatar-wrap-premium">
                        <img
                          src={cm.photo?.fileName ? `${BASE_URL}/uploads/committee/${cm.photo.fileName}` : (cm.photo?.filePath || "https://randomuser.me/api/portraits/men/32.jpg")}
                          alt={cm.name}
                          onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }}
                        />
                      </div>
                      <div className="advisory-info-premium">
                        <h3>{cm.academicTitle && !cm.name.trim().startsWith(cm.academicTitle.trim()) ? `${cm.academicTitle} ` : ''}{cm.name}</h3>
                        <p className="advisory-role-premium">{cm.role || "Local Organizing Committee"}</p>
                        <p className="advisory-org-premium">{cm.affiliation}{cm.country ? `, ${cm.country}` : ""}</p>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <h3 style={{ fontSize: "20px", color: "#334155", marginBottom: "12px" }}>Committee Members to be Announced</h3>
              <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto" }}>The organizing committee is currently being formed. Information will be updated shortly.</p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Dynamic Tabs Section */}
      {sections && sections.filter(sec => sec.isVisible !== false).length > 0 && (
        <section className="conf-dynamic-tabs-section anim-section mob-anim-section" style={{ padding: "60px 0", backgroundColor: "#ffffff" }}>
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <div className="classic-agenda-tabs max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-2 scrollbar-hide" style={{ marginBottom: "30px", justifyContent: "center" }}>
              {sections.filter(sec => sec.isVisible !== false).map((sec) => (
                <button
                  type="button"
                  key={sec.id}
                  className={`classic-tab-btn ${activeSection?.id === sec.id ? "active" : ""}`}
                  onClick={() => setActiveSection(sec)}
                >
                  {sec.sectionName}
                </button>
              ))}
            </div>

            {activeSection && activeSection.items && activeSection.items.filter(item => item.isVisible !== false).length > 0 ? (
              <div className="conf-advisory-grid-redesigned max-md:grid max-md:grid-cols-1 max-lg:grid-cols-2 max-md:gap-4">
                {activeSection.items.filter(item => item.isVisible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(item => (
                  <div key={item.id} className="advisory-card-premium">
                    <div 
                      className="advisory-avatar-wrap-premium"
                      style={{ cursor: item.description ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (item.description) {
                          setSelectedBioSpeaker({
                            name: item.name,
                            designation: item.designation,
                            org: `${item.organization}${item.country ? `, ${item.country}` : ''}`,
                            photoUrl: item.imagePath ? (item.imagePath.startsWith('http') ? item.imagePath : `${BASE_URL}${item.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg",
                            bio: item.description,
                            website: item.websiteUrl,
                            linkedin: item.linkedinUrl
                          });
                        }
                      }}
                    >
                      <img
                        src={item.imagePath ? (item.imagePath.startsWith('http') ? item.imagePath : `${BASE_URL}${item.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg"}
                        alt={item.name}
                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }}
                      />
                    </div>
                    <div className="advisory-info-premium">
                      <h3>{item.name}</h3>
                      <p className="advisory-role-premium">{item.designation}</p>
                      <p className="advisory-org-premium">{item.organization}{item.country ? `, ${item.country}` : ''}</p>
                      {item.description && (
                        <button type="button" className="btn-read-bio-sm-premium" onClick={() => setSelectedBioSpeaker({
                          name: item.name,
                          designation: item.designation,
                          org: `${item.organization}${item.country ? `, ${item.country}` : ''}`,
                          photoUrl: item.imagePath ? (item.imagePath.startsWith('http') ? item.imagePath : `${BASE_URL}${item.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg",
                          bio: item.description,
                          website: item.websiteUrl,
                          linkedin: item.linkedinUrl
                        })}>
                          Read Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                No active entries found for this tab.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Conference Agenda Section */}
      <section className="conf-agenda-section-redesigned anim-section mob-anim-section" id="agenda-schedule">
        <div className="container">
          <div className="conf-section-header">
            <span className="sponsors-tag-pill">Scientific Timetable</span>
            <h2>Conference Agenda & Program</h2>
            <p style={{ color: "#718096", fontSize: "15px", maxWidth: "600px", margin: "0 auto", marginBottom: "20px" }}>
              Explore scheduled keynotes, oral presentations, breaks, and workshops. Click any row to view abstract and biography details.
            </p>

            {conference.agendaPdfPath && (
              <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap", marginTop: "15px", marginBottom: "30px" }}>
                <a
                  href={`${BASE_URL}${conference.agendaPdfPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-download-agenda-premium"
                >
                  📄 Download Program PDF File
                </a>
                <button type="button" onClick={() => window.print()} className="btn-print-program-premium">
                  🖨️ Print Scientific Program
                </button>
              </div>
            )}
          </div>

          {agendaDays && agendaDays.length > 0 ? (
            <React.Fragment>
              <div className="classic-agenda-tabs max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-2 scrollbar-hide">
                {agendaDays.map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    className={`classic-tab-btn ${activeAgendaDayId === d.id ? "active" : ""}`}
                    onClick={() => setActiveAgendaDayId(d.id)}
                  >
                    {getDayTabTitle(d)}
                  </button>
                ))}
              </div>

              {(() => {
                const activeD = agendaDays.find(d => d.id === activeAgendaDayId);
                const activeSessionsList = activeD ? activeD.sessions || [] : [];

                // Group by hall
                const groupedByHall = {};
                activeSessionsList.filter(s => s.status !== "INACTIVE").forEach(s => {
                  const h = s.hall || "Meeting Hall-1";
                  if (!groupedByHall[h]) groupedByHall[h] = [];
                  groupedByHall[h].push(s);
                });

                return (
                  <div className="classic-agenda-layout max-md:flex max-md:flex-col">
                    {/* Left Timeline Anchor */}
                    <div className="classic-timeline-sidebar no-print max-md:w-full max-md:flex max-md:flex-row max-md:items-center max-md:justify-between max-md:mb-6 max-md:border-none">
                      <div className="classic-timeline-day">
                        DAY {activeD?.dayNumber} AGENDA<br />
                        <span style={{ fontWeight: 'normal', fontSize: '13px', color: '#64748b' }}>
                          {getDayDateString(activeD?.dayNumber)}
                        </span>
                      </div>
                      <div className="classic-timeline-time-block">
                        <div className="classic-time-label">08:00</div>
                        <div className="classic-timeline-line">
                          <div className="classic-timeline-arrow"></div>
                        </div>
                        <div className="classic-time-label">17:00</div>
                      </div>
                    </div>

                    {/* Main Container */}
                    <div className="classic-agenda-container">
                      <div className="classic-agenda-header-box">
                        <h2 className="classic-conf-title">{conference.title || "Conference Title"}</h2>
                        <h3 className="classic-conf-subtitle">({conference.shortName || "Conference Short Name"})</h3>
                        <div className="classic-conf-date-loc">
                          {formattedDate}, {venue}
                        </div>
                      </div>

                      {Object.keys(groupedByHall).length === 0 ? (
                        <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No active sessions found for this day.</p>
                      ) : (
                        Object.keys(groupedByHall).map(hall => {
                          const hallSessions = groupedByHall[hall].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

                          return (
                            <div key={hall} className="classic-hall-group">
                              <div className="classic-hall-header">Scientific Program</div>
                              <div className="classic-hall-header">Day {activeD?.dayNumber} - {getDayDateString(activeD?.dayNumber)}</div>
                              <div className="classic-hall-header">{hall}</div>

                              <table className="classic-agenda-table max-md:block">
                                <tbody className="max-md:block">
                                  {hallSessions.map(slot => {
                                    const isMerged = !slot.speakerName || slot.sessionType?.toLowerCase().includes('break') || slot.sessionType?.toLowerCase().includes('registration') || slot.sessionType?.toLowerCase().includes('opening');

                                    if (isMerged) {
                                      const isPurple = slot.sessionType?.toLowerCase().includes('break') || slot.sessionType?.toLowerCase().includes('keynote');
                                      return (
                                        <tr key={slot.id} className="classic-merged-row">
                                          <td colSpan="3" className={`classic-merged-cell ${isPurple ? 'text-purple' : 'text-green'} max-md:block max-md:text-center max-md:p-4 max-md:border max-md:border-gray-100 max-md:rounded-lg max-md:mb-4`}>
                                            {slot.sessionTitle} {slot.startTime ? `(${slot.startTime}-${slot.endTime})` : ''}
                                          </td>
                                        </tr>
                                      );
                                    }

                                    return (
                                      <tr key={slot.id} className="classic-data-row max-md:block max-md:mb-4 max-md:border max-md:border-gray-200 max-md:rounded-lg max-md:bg-white max-md:shadow-sm" onClick={() => setSelectedAgendaDetail(slot)}>
                                        <td className="classic-presenter-cell max-md:block max-md:p-4">
                                          <div className="classic-presenter-name">{slot.speakerName}</div>
                                          <div className="classic-presenter-org">
                                            {slot.organization}{slot.country ? `, ${slot.country}` : ""}
                                          </div>
                                        </td>
                                        <td className="classic-time-cell max-md:block max-md:text-left max-md:px-4 max-md:font-bold">
                                          {slot.startTime} - {slot.endTime}
                                        </td>
                                        <td className="classic-title-cell max-md:block max-md:text-left max-md:p-4">
                                          {slot.sessionTitle}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
            </React.Fragment>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", marginTop: "20px" }}>
              <h3 style={{ fontSize: "20px", color: "#334155", marginBottom: "12px" }}>Agenda to be Announced</h3>
              <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto" }}>The scientific program and timetable are currently under review. Please check back later for detailed session schedules.</p>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Scientific Session Details Modal */}
      {selectedAgendaDetail && (
        <div className="conf-modal-overlay" onClick={() => setSelectedAgendaDetail(null)}>
          <div className="conf-modal-premium" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
            <button className="conf-modal-close" onClick={() => setSelectedAgendaDetail(null)}>×</button>

            <div className="agenda-modal-header-premium">
              <span className="type-badge" style={{
                background: getSessionTypeBadgeStyle(selectedAgendaDetail.sessionType).bg,
                color: getSessionTypeBadgeStyle(selectedAgendaDetail.sessionType).color,
                marginBottom: '12px',
                display: 'inline-block'
              }}>
                {selectedAgendaDetail.sessionType}
              </span>
              <h2 className="agenda-modal-main-title">
                {selectedAgendaDetail.sessionTitle}
              </h2>
            </div>

            <div className="agenda-modal-body-premium">
              <div className="agenda-modal-meta-grid">
                <div className="agenda-meta-item">
                  <div className="agenda-meta-label">🕒 Time</div>
                  <div className="agenda-meta-value">{selectedAgendaDetail.startTime} - {selectedAgendaDetail.endTime}</div>
                </div>
                <div className="agenda-meta-item">
                  <div className="agenda-meta-label">📍 Venue</div>
                  <div className="agenda-meta-value">{selectedAgendaDetail.hall || 'Main Hall'}</div>
                </div>
                {selectedAgendaDetail.track && (
                  <div className="agenda-meta-item">
                    <div className="agenda-meta-label">📑 Track</div>
                    <div className="agenda-meta-value">{selectedAgendaDetail.track}</div>
                  </div>
                )}
                {selectedAgendaDetail.chairperson && (
                  <div className="agenda-meta-item">
                    <div className="agenda-meta-label">👤 Session Chair</div>
                    <div className="agenda-meta-value">{selectedAgendaDetail.chairperson}</div>
                  </div>
                )}
              </div>

              {selectedAgendaDetail.speakerName && (
                <div className="agenda-presenter-card">
                  <div className="agenda-presenter-avatar-placeholder">
                    {selectedAgendaDetail.speakerName.charAt(0)}
                  </div>
                  <div>
                    <div className="agenda-meta-label" style={{ marginBottom: '2px' }}>Presenter</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                      {selectedAgendaDetail.speakerName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                      {selectedAgendaDetail.organization}{selectedAgendaDetail.country ? `, ${selectedAgendaDetail.country}` : ''}
                    </div>
                  </div>
                </div>
              )}

              {selectedAgendaDetail.abstractText && (
                <div className="agenda-modal-text-section">
                  <h4 className="agenda-modal-section-title">📄 Abstract Summary</h4>
                  <p className="agenda-modal-text">
                    {selectedAgendaDetail.abstractText}
                  </p>
                </div>
              )}

              {selectedAgendaDetail.biography && (
                <div className="agenda-modal-text-section">
                  <h4 className="agenda-modal-section-title">🎤 Speaker Biography</h4>
                  <p className="agenda-modal-text">
                    {selectedAgendaDetail.biography}
                  </p>
                </div>
              )}

              {/* Exports inside modal */}
              <div className="agenda-modal-footer-actions no-print">
                <button type="button" onClick={() => downloadIcsFile(selectedAgendaDetail, conference?.startDate)} className="cal-btn-outline">📅 Export ICS</button>
                <a href={getGoogleCalendarUrl(selectedAgendaDetail, conference?.startDate)} target="_blank" rel="noreferrer" className="cal-btn-outline">🌐 Google Calendar</a>
                <a href={getOutlookCalendarUrl(selectedAgendaDetail, conference?.startDate)} target="_blank" rel="noreferrer" className="cal-btn-outline">💻 Outlook Web</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Partners & Sponsors Section (Admin added only) */}
      {sponsors && sponsors.length > 0 && (
        <section className="conf-sponsors-partners-section anim-section mob-anim-section">
          <div className="container">
            <div className="conf-section-header">
              <span className="sponsors-tag-pill">Partnerships</span>
              <h2>Media Partners &amp; Sponsors</h2>
              <p style={{ color: "#718096", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
                We are proud to collaborate with prestigious indexing partners, academic publishers, and corporate supporters.
              </p>
            </div>

            {(() => {
              const groups = {};
              sponsors.forEach(s => {
                const tier = s.tier || "SILVER";
                if (!groups[tier]) groups[tier] = [];
                groups[tier].push(s);
              });

              const tierOrder = ["PLATINUM", "GOLD", "SILVER", "BRONZE", "PARTNER"];

              return (
                <div className="sponsors-tiers-container">
                  {tierOrder.map(tier => {
                    const list = groups[tier];
                    if (!list || list.length === 0) return null;

                    const label = tier.charAt(0) + tier.slice(1).toLowerCase();

                    return (
                      <div key={tier} className={`sponsor-tier-group tier-${tier.toLowerCase()}`}>
                        <div className="tier-badge-header">
                          <span className="tier-badge-label">{label} Partners</span>
                        </div>
                        <div className="sponsor-logos-grid max-md:grid max-md:grid-cols-2 max-[480px]:grid-cols-1 max-md:gap-4">
                          {list.map(sp => {
                            const logoUrl = (sp.image?.filePath && sp.image.filePath.startsWith("http"))
                              ? sp.image.filePath
                              : (sp.image?.fileName
                                  ? `/uploads/sponsors/${sp.image.fileName}`
                                  : null);

                            return (
                              <div key={sp.id} className="sponsor-logo-box">
                                <div className="logo-inner">
                                  {logoUrl ? (
                                    <img src={logoUrl} alt={sp.sponsorName} className="sponsor-img-element" />
                                  ) : (
                                    <span className="sponsor-text-element">{sp.sponsorName}</span>
                                  )}
                                </div>
                                <div className="logo-hover-details">
                                  <h4>{sp.sponsorName}</h4>
                                  {sp.description && <p>{sp.description}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>
      )}



      {/* Info Update Section below Registration */}
      {(() => {
        const fallbackInfoUpdates = [
          {
            title: "Suggest a Speaker",
            imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
            link: "suggest-speaker",
            color: "#ec4899"
          },
          {
            title: "Conferences",
            imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80",
            link: "https://intelevoresearch.com",
            color: "#f97316"
          },
          {
            title: "Latest News",
            imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80",
            link: "latest-news",
            color: "#f97316"
          }
        ];

        const activeInfoUpdates = infoUpdates && infoUpdates.length > 0 ? infoUpdates : fallbackInfoUpdates;

        return (
          <section className="conf-info-update-section anim-section mob-anim-section" style={{ padding: "80px 0", backgroundColor: "#f8fafc" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
              <div className="conf-section-header" style={{ textAlign: "center", marginBottom: "50px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase" }}>Info Update</span>
                <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#f97316", marginTop: "10px", textTransform: "none" }}>Latest News</h2>
              </div>

              <div ref={scrollRef} className="info-updates-grid">
                {activeInfoUpdates.map((item, idx) => {
                  const isExternal = item.link.startsWith('http');
                  const CardWrapper = isExternal ? 'a' : Link;
                  const hrefProp = isExternal 
                    ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } 
                    : { to: getSubRoutePath ? getSubRoutePath(item.link) : `/${item.link}` };

                  return (
                    <CardWrapper
                      key={idx}
                      {...hrefProp}
                      className="info-update-card"
                    >
                      <div className="info-update-card-img-wrap">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="info-card-image"
                        />
                      </div>
                      <div className="info-update-card-body">
                        <h3 className="info-update-card-title" style={{ color: item.color }}>
                          {item.title}
                        </h3>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (() => {
        const categories = ["ALL", ...new Set(galleryImages.map(img => img.category).filter(Boolean))];
        const filtered = galleryFilter === "ALL" ? galleryImages : galleryImages.filter(img => img.category === galleryFilter);

        const resolveGalleryUrl = (img) => {
          const url = img.imageUrl || "";
          if (!url) return null;
          if (url.startsWith("http") || url.startsWith("data:")) return url;
          if (url.startsWith("/uploads")) return `${BASE_URL}${url}`;
          return url;
        };

        return (
          <section className="conf-gallery-section anim-section mob-anim-section" style={{ padding: "80px 0", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
              <div className="conf-section-header" style={{ textAlign: "center", marginBottom: "40px" }}>
                <span className="sponsors-tag-pill">Photos</span>
                <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginTop: "12px", marginBottom: "8px" }}>Event Gallery</h2>
                <p style={{ color: "#64748b", fontSize: "15px" }}>Moments captured from our conference events</p>
              </div>

              {/* Category Filter Tabs */}
              {categories.length > 2 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setGalleryFilter(cat)}
                      style={{
                        padding: "7px 20px", borderRadius: "20px", border: "1px solid",
                        borderColor: galleryFilter === cat ? "var(--conf-primary, #e74c3c)" : "#cbd5e1",
                        background: galleryFilter === cat ? "var(--conf-primary, #e74c3c)" : "#fff",
                        color: galleryFilter === cat ? "#fff" : "#475569",
                        fontWeight: "600", fontSize: "13px", cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Photo Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                {filtered.map((img, i) => {
                  const src = resolveGalleryUrl(img);
                  if (!src) return null;
                  return (
                    <div
                      key={img.id || i}
                      onClick={() => setLightboxImg(src)}
                      style={{
                        borderRadius: "10px", overflow: "hidden", cursor: "zoom-in",
                        height: "220px", position: "relative", background: "#e2e8f0",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.25s, box-shadow 0.25s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.14)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
                    >
                      <img
                        src={src}
                        alt={img.caption || "Gallery photo"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {img.caption && (
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                          padding: "20px 14px 12px", color: "#fff", fontSize: "13px", fontWeight: "500"
                        }}>
                          {img.caption}
                        </div>
                      )}
                      <div style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center",
                        justifyContent: "center", background: "rgba(0,0,0,0)", transition: "background 0.2s",
                        fontSize: "28px", opacity: 0
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.25)"; e.currentTarget.style.opacity = "1"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0)"; e.currentTarget.style.opacity = "0"; }}
                      >
                        🔍
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Redesigned Premium Bio & Profile Modal */}
      {selectedBioSpeaker && (
        <div className="conf-modal-overlay" onClick={() => setSelectedBioSpeaker(null)}>
          <div className="conf-modal-card-premium" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="conf-modal-close-premium" onClick={() => setSelectedBioSpeaker(null)}>×</button>
            <div className="conf-modal-content-grid-premium">
              <div className="conf-modal-img-wrap-premium">
                <img
                  src={selectedBioSpeaker.photoUrl}
                  alt={selectedBioSpeaker.name}
                  onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }}
                />
              </div>
              <div className="conf-modal-text-wrap-premium">
                <h2>{selectedBioSpeaker.name}</h2>
                <p className="modal-role-premium">{selectedBioSpeaker.designation}</p>
                <p className="modal-affiliation-premium">{selectedBioSpeaker.org}</p>

                {/* Social/Profile links in modal */}
                {(selectedBioSpeaker.linkedin || selectedBioSpeaker.orcid || selectedBioSpeaker.website) && (
                  <div className="modal-social-links-premium">
                    {selectedBioSpeaker.linkedin && <a href={selectedBioSpeaker.linkedin} target="_blank" rel="noreferrer">🔗 LinkedIn</a>}
                    {selectedBioSpeaker.orcid && <a href={`https://orcid.org/${selectedBioSpeaker.orcid}`} target="_blank" rel="noreferrer">🆔 ORCID Identifier</a>}
                    {selectedBioSpeaker.website && <a href={selectedBioSpeaker.website} target="_blank" rel="noreferrer">🌐 Personal Website</a>}
                  </div>
                )}

                <div className="modal-divider-premium"></div>
                <div className="modal-bio-premium">
                  <h3>Biography</h3>
                  <p style={{ whiteSpace: "pre-line" }}>{selectedBioSpeaker.bio || "Biography details are currently pending publication."}</p>

                  {selectedBioSpeaker.research && (
                    <div style={{ marginTop: '15px' }}>
                      <strong>Expertise:</strong> {selectedBioSpeaker.research}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY LIGHTBOX */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
          }}
        >
          <img src={lightboxImg} alt="Gallery" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '10px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: '24px', right: '32px', background: 'none', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default ConferenceHome;
