(() => {
  const en = document.documentElement.lang === 'en';
  const root = new URL('icon-bank/chores-board/', document.currentScript.src).href;
  const shareRoot = '/icon-bank/chores-board/';
  const tasks = [
    ['tidy-room', 'מסדרים את החדר', 'Tidy the room'],
    ['clear-dishes', 'מפנים כלים מהשולחן', 'Clear the dishes'],
    ['dishwasher', 'מכניסים כלים למדיח', 'Load the dishwasher'],
    ['set-table', 'עורכים את השולחן', 'Set the table'],
    ['tidy-toys', 'מסדרים צעצועים', 'Put away toys'],
    ['make-bed', 'מסדרים את המיטה', 'Make the bed'],
    ['laundry-basket', 'שמים בגדים בסל הכביסה', 'Put clothes in the laundry basket'],
    ['fold-clothes', 'מקפלים בגדים', 'Fold clothes'],
    ['wipe-table', 'מנגבים את השולחן', 'Wipe the table']
  ];
  const words = en ? { add: 'Add', remove: 'Remove', up: 'Move up', down: 'Move down', mark: 'Mark complete', choose: 'Choose a few chores to start your board.', copy: 'Link copied', copyFail: 'Copy the link from the field below', noTasks: 'Choose at least one chore first' } : { add: 'הוספה', remove: 'הסרה', up: 'העברה למעלה', down: 'העברה למטה', mark: 'סימון שבוצע', choose: 'בחרו כמה מטלות כדי להתחיל את הלוח.', copy: 'הקישור הועתק', copyFail: 'אפשר להעתיק את הקישור מהשדה', noTasks: 'בחרו לפחות מטלה אחת' };
  const $ = id => document.getElementById(id);
  const chosen = [];
  const library = $('choices'), board = $('board'), status = $('status');
  const label = task => task.custom || (en ? task[2] : task[1]);
  const image = task => task.custom ? '' : `${root}${task[0]}.webp`;
  function renderChoices() {
    library.replaceChildren();
    tasks.forEach(task => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'choice';
      const selected = chosen.some(item => item[0] === task[0]);
      if (selected) button.classList.add('selected');
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? words.remove : words.add}: ${label(task)}`);
      const img = document.createElement('img'); img.src = image(task); img.alt = ''; img.loading = 'lazy';
      const name = document.createElement('span'); name.textContent = label(task);
      button.append(img, name);
      button.addEventListener('click', () => {
        const index = chosen.findIndex(item => item[0] === task[0]);
        if (index >= 0) chosen.splice(index, 1); else chosen.push([...task]);
        render();
      }); library.append(button);
    });
  }
  function control(text, action, disabled = false) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
    button.title = action; button.setAttribute('aria-label', action); button.disabled = disabled;
    return button;
  }
  function renderBoard() {
    board.replaceChildren();
    if (!chosen.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = words.choose; board.append(empty); return; }
    chosen.forEach((task, index) => {
      const row = document.createElement('div'); row.className = `task${task.custom ? ' no-image' : ''}${task.done ? ' done' : ''}`;
      const checkboxLabel = document.createElement('label');
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = Boolean(task.done); checkbox.setAttribute('aria-label', `${words.mark}: ${label(task)}`);
      checkbox.addEventListener('change', () => { task.done = checkbox.checked; row.classList.toggle('done', task.done); }); checkboxLabel.append(checkbox); row.append(checkboxLabel);
      if (!task.custom) { const img = document.createElement('img'); img.src = image(task); img.alt = ''; row.append(img); }
      const name = document.createElement('strong'); name.textContent = label(task); row.append(name);
      const buttons = document.createElement('div'); buttons.className = 'task-controls';
      const up = control('↑', `${words.up}: ${label(task)}`, index === 0); up.onclick = () => { [chosen[index - 1], chosen[index]] = [chosen[index], chosen[index - 1]]; render(); };
      const down = control('↓', `${words.down}: ${label(task)}`, index === chosen.length - 1); down.onclick = () => { [chosen[index + 1], chosen[index]] = [chosen[index], chosen[index + 1]]; render(); };
      const remove = control('×', `${words.remove}: ${label(task)}`); remove.onclick = () => { chosen.splice(index, 1); render(); };
      buttons.append(up, down, remove); row.append(buttons); board.append(row);
    });
  }
  function render() { renderChoices(); renderBoard(); }
  $('custom-form').addEventListener('submit', event => {
    event.preventDefault(); const input = $('custom-task'); const value = input.value.trim(); if (!value) return;
    chosen.push({ custom: value.slice(0, 80), done: false }); input.value = ''; render();
  });
  $('board-title').addEventListener('input', () => { $('print-title').textContent = $('board-title').value.trim() || $('board-title').placeholder; });
  function encodedBoard() {
    return btoa(unescape(encodeURIComponent(JSON.stringify(chosen.map(task => [task.custom ? '' : `${shareRoot}${task[0]}.webp`, label(task)]))))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  $('share').onclick = () => {
    if (!chosen.length) { status.textContent = words.noTasks; return; }
    const path = en ? '/en/child/daily-routine/' : '/child/daily-routine/';
    const title = $('board-title').value.trim() || $('board-title').placeholder;
    $('share-url').value = new URL(`${path}?d=${encodedBoard()}&t=${encodeURIComponent(title)}&kind=chores`, location.origin).href;
    $('share-dialog').showModal();
  };
  $('copy').onclick = async () => {
    try { await navigator.clipboard.writeText($('share-url').value); $('copy-status').textContent = words.copy; }
    catch { $('share-url').select(); $('copy-status').textContent = words.copyFail; }
  };
  $('close-dialog').onclick = () => $('share-dialog').close();
  function print(large) { if (!chosen.length) { status.textContent = words.noTasks; return; } document.body.classList.toggle('print-large', large); window.print(); }
  $('print-small').onclick = () => print(false); $('print-large').onclick = () => print(true);
  $('print-title').textContent = $('board-title').value.trim() || $('board-title').placeholder;
  render();
})();
