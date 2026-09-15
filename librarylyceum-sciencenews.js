(function () {
  "use strict";

  var activity = document.getElementById("activity");
  if (!activity) return;

  var SOURCES = [
    {
      id: "nyt",
      type: "news",
      label: "Brincat, To Get a Man’s Attention, Meow Harder",
      html: 'Brincat, Clarissa. “To Get a Man’s Attention, Meow Harder.” <cite>The New York Times</cite>, 27 Nov. 2025, <a href="https://www.nytimes.com/2025/11/27/science/cats-meow-men-women.html" target="_blank" rel="noopener">www.nytimes.com/2025/11/27/science/cats-meow-men-women.html<span class="visually-hidden"> (opens in a new tab)</span></a>. Accessed 15 Sept. 2026.'
    },
    {
      id: "cdc",
      type: "informational",
      label: "Cats, CDC Healthy Pets, Healthy People",
      html: '“Cats.” <cite>Healthy Pets, Healthy People</cite>, Centers for Disease Control and Prevention, 15 June 2026, <a href="https://www.cdc.gov/healthy-pets/about/cats.html" target="_blank" rel="noopener">www.cdc.gov/healthy-pets/about/cats.html<span class="visually-hidden"> (opens in a new tab)</span></a>. Accessed 15 Sept. 2026.'
    },
    {
      id: "ethology",
      type: "scholarly",
      label: "Demirbaş et al., Greeting Vocalizations in Domestic Cats",
      html: 'Demirbaş, Yasemin Salgırlı, et al. “Greeting Vocalizations in Domestic Cats Are More Frequent with Male Caregivers.” <cite>Ethology</cite>, vol. 132, no. 2, 2026, pp. 87–94. <a href="https://doi.org/10.1111/eth.70033" target="_blank" rel="noopener">https://doi.org/10.1111/eth.70033<span class="visually-hidden"> (opens in a new tab)</span></a>. Accessed 15 Sept. 2026.'
    },
    {
      id: "moderncat",
      type: "news",
      label: "Frosek, Cats Meow More at Male Caregivers",
      html: 'Frosek, Rose. “Cats Meow More at Male Caregivers—Scientists Think They Know Why.” <cite>Modern Cat</cite>, 10 June 2026, <a href="https://moderncat.com/articles/cats-meow-more-at-male-caregivers-study/" target="_blank" rel="noopener">moderncat.com/articles/cats-meow-more-at-male-caregivers-study/<span class="visually-hidden"> (opens in a new tab)</span></a>. Accessed 15 Sept. 2026.'
    },
    {
      id: "salem",
      type: "informational",
      label: "Berman, Felidae",
      html: 'Berman, Milton. “Felidae.” <cite>Salem Press Encyclopedia of Science</cite>, Mar. 2026. <cite>EBSCOhost</cite>, <a href="https://research.ebsco.com/plink/4c8e2392-43d7-3047-bfc0-1cc72b5153ea" target="_blank" rel="noopener">research.ebsco.com/plink/4c8e2392-43d7-3047-bfc0-1cc72b5153ea<span class="visually-hidden"> (opens in a new tab)</span></a>. Accessed 15 Sept. 2026.'
    }
  ];

  var NAMES = { news: "News", informational: "Information", scholarly: "Scholarly", pool: "Citations" };

  var status = document.getElementById("activity-status");
  var bins = {};
  var chosen = null;

  Array.prototype.forEach.call(activity.querySelectorAll("[data-bin]"), function (el) {
    bins[el.dataset.bin] = {
      wrap: el,
      list: el.querySelector(".source-list"),
      empty: el.querySelector(".activity-empty"),
      place: el.querySelector(".bin-place")
    };
  });

  function say(text) { status.textContent = text; }

  function build(src) {
    var li = document.createElement("li");
    li.className = "source";
    li.id = "src-" + src.id;
    li.draggable = true;
    li.dataset.type = src.type;

    var p = document.createElement("p");
    p.innerHTML = src.html;
    li.appendChild(p);

    var note = document.createElement("span");
    note.className = "source-note";
    note.hidden = true;
    li.appendChild(note);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "source-select";
    btn.textContent = "Choose";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Choose: " + src.label);
    btn.addEventListener("click", function () { choose(li); });
    li.appendChild(btn);

    li.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", li.id);
      e.dataTransfer.effectAllowed = "move";
      li.classList.add("dragging");
    });
    li.addEventListener("dragend", function () { li.classList.remove("dragging"); });

    return li;
  }

  function choose(li) {
    var already = li.classList.contains("chosen");
    clearChoice();
    if (already) {
      say("Nothing chosen.");
      return;
    }
    chosen = li;
    li.classList.add("chosen");
    li.querySelector(".source-select").setAttribute("aria-pressed", "true");
    Object.keys(bins).forEach(function (key) {
      bins[key].place.disabled = (key === li.parentNode.parentNode.dataset.bin);
      bins[key].wrap.classList.toggle("armed", !bins[key].place.disabled);
    });
    say("Chosen. Now choose a category.");
  }

  function clearChoice() {
    if (chosen) {
      chosen.classList.remove("chosen");
      chosen.querySelector(".source-select").setAttribute("aria-pressed", "false");
    }
    chosen = null;
    Object.keys(bins).forEach(function (key) {
      bins[key].place.disabled = true;
      bins[key].wrap.classList.remove("armed");
    });
  }

  function move(li, key) {
    li.removeAttribute("data-verdict");
    var note = li.querySelector(".source-note");
    note.hidden = true;
    note.textContent = "";
    bins[key].list.appendChild(li);
    refresh();
  }

  function refresh() {
    Object.keys(bins).forEach(function (key) {
      var count = bins[key].list.children.length;
      bins[key].empty.hidden = count > 0;
    });
  }

  Object.keys(bins).forEach(function (key) {
    var bin = bins[key];

    bin.place.addEventListener("click", function () {
      if (!chosen) return;
      var li = chosen;
      clearChoice();
      move(li, key);
      say("Moved to " + NAMES[key] + ".");
      li.querySelector(".source-select").focus();
    });

    bin.wrap.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      bin.wrap.classList.add("over");
    });

    bin.wrap.addEventListener("dragleave", function () { bin.wrap.classList.remove("over"); });

    bin.wrap.addEventListener("drop", function (e) {
      e.preventDefault();
      bin.wrap.classList.remove("over");
      var id = e.dataTransfer.getData("text/plain");
      var li = id && document.getElementById(id);
      if (!li) return;
      clearChoice();
      move(li, key);
      say("Moved to " + NAMES[key] + ".");
    });
  });

  document.getElementById("check-answers").addEventListener("click", function () {
    var right = 0, placed = 0;

    Object.keys(bins).forEach(function (key) {
      Array.prototype.forEach.call(bins[key].list.children, function (li) {
        var note = li.querySelector(".source-note");
        if (key === "pool") {
          li.removeAttribute("data-verdict");
          note.hidden = true;
          return;
        }
        placed++;
        note.hidden = false;
        if (li.dataset.type === key) {
          right++;
          li.dataset.verdict = "right";
          note.textContent = "Correct";
        } else {
          li.dataset.verdict = "wrong";
          note.textContent = "Try another category";
        }
      });
    });

    if (placed === 0) {
      say("Nothing placed yet. Choose a citation, then choose a category.");
    } else if (right === SOURCES.length) {
      say("You did it! You correctly identified all sources! (I hope) you’re ready to find news articles for your assignment!");
    } else {
      say(right + " of " + placed + " placed correctly. For each citation marked “Try another category,” ask what it was written to do: report a recent event, brief you on a subject, or present original research. The byline, the date and the publication name help, but might mislead you." +
        (placed < SOURCES.length ? " " + (SOURCES.length - placed) + " still unplaced." : ""));
    }
  });

  document.getElementById("reset-activity").addEventListener("click", function () {
    clearChoice();
    SOURCES.forEach(function (src) {
      var li = document.getElementById("src-" + src.id);
      move(li, "pool");
    });
    say("Cleared. All five citations are back in the list.");
  });

  SOURCES.forEach(function (src) { bins.pool.list.appendChild(build(src)); });
  refresh();
})();
