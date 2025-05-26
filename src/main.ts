import './style.scss';
// import CustomDropdown from './ts/dropdown';

// Определение типов данных
interface Contact {
  id: string;
  name: string;
  phone: string;
  groupId: string;
}

interface Group {
  id: string;
  name: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Класс для управления всем приложением
class ContactBook {
  private contacts: Contact[] = [];
  private groups: Group[] = [];
  private menuManager: MenuManager;
  private groupsManager: GroupsManager;
  private contactsManager: ContactsManager;
  private dropdownManager: DropdownManager;
  public popupManager: PopupManager;
  private toasterManager: ToasterManager;
  // private validator: Validator;

  constructor() {
    // Загрузка данных из localStorage
    this.loadData();

    // Инициализация менеджеров
    this.menuManager = new MenuManager();
    this.groupsManager = new GroupsManager(this);
    this.contactsManager = new ContactsManager(this);
    this.dropdownManager = new DropdownManager();
    this.popupManager = new PopupManager(this.menuManager, this.groupsManager);
    this.toasterManager = new ToasterManager();
    // this.validator = new Validator();

    // Инициализация обработчиков событий
    this.initEventListeners();

    // Отрисовка начального состояния
    this.render();

    // Заполняем инпуты для групп при загрузке страницы
    this.groupsManager.renderGroupsMenu();
  }

  // Инициализация обработчиков событий
  private initEventListeners(): void {
    // Обработчики для кнопок добавления контакта
    const addContactButtons = document.querySelectorAll(
      '[data-menu="contacts"]'
    );
    addContactButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.menuManager.openMenu('contacts');
        this.updateGroupsDropdown();
      });
    });

    // Обработчик для кнопки групп
    const groupsButton = document.querySelector('[data-menu="groups"]');
    if (groupsButton) {
      groupsButton.addEventListener('click', () => {
        this.menuManager.openMenu('group');
        this.groupsManager.renderGroupsMenu();
      });
    }

    // Обработчик для добавления группы в меню групп
    const addGroupButton = document.querySelector(
      '.menu-group[data-menu="group"] .button_transparent'
    );
    if (addGroupButton) {
      addGroupButton.addEventListener('click', () => {
        this.groupsManager.addGroupField();
      });
    }

    // Обработчик для сохранения групп
    const saveGroupsButton = document.querySelector(
      '.menu-group[data-menu="group"] .button_primary'
    );
    if (saveGroupsButton) {
      saveGroupsButton.addEventListener('click', () => {
        const validation = this.groupsManager.validateAndSaveGroups();
        if (validation.isValid) {
          this.menuManager.closeAllMenus();
          this.toasterManager.showToaster('Группы успешно сохранены');
          this.render();
        } else {
          this.toasterManager.showToaster(validation.errors.join(', '), 5000);
        }
      });
    }

    // Обработчик для сохранения контакта
    const saveContactButton = document.querySelector(
      '.menu-group[data-menu="contacts"] .button_primary'
    );
    if (saveContactButton) {
      saveContactButton.addEventListener('click', () => {
        const validation = this.contactsManager.validateAndSaveContact();
        if (validation.isValid) {
          this.menuManager.closeAllMenus();
          this.toasterManager.showToaster('Контакт успешно добавлен');
          this.render();
        } else {
          this.toasterManager.showToaster(validation.errors.join(', '), 5000);
        }
      });
    }

    // Устанавливаем обработчики для кнопок закрытия
    this.setupCloseButtonHandlers();
  }

  // Метод для установки обработчиков кнопок закрытия
  public setupCloseButtonHandlers(): void {
    const closeButtons = document.querySelectorAll('.button_close');
    closeButtons.forEach((button) => {
      // Удаляем старый обработчик если есть
      button.removeEventListener('click', this.handleCloseClick);
      // Добавляем новый обработчик
      button.addEventListener('click', this.handleCloseClick);
    });
  }

  // Обработчик для кнопок закрытия
  private handleCloseClick = (): void => {
    this.menuManager.closeAllMenus();
    this.popupManager.closePopup();
  };

  // Загрузка данных из localStorage
  private loadData(): void {
    const contactsData = localStorage.getItem('contacts');
    const groupsData = localStorage.getItem('groups');

    if (contactsData) {
      this.contacts = JSON.parse(contactsData);
    } else {
      // Демо-данные для контактов
      this.contacts = [
        {
          id: '1',
          name: 'Иванов Иван Иванович',
          phone: '+7 (900) 123-45-67',
          groupId: '1',
        },
        {
          id: '2',
          name: 'Петров Петр Петрович',
          phone: '+7 (900) 987-65-43',
          groupId: '1',
        },
        {
          id: '3',
          name: 'Сидоров Сидор Сидорович',
          phone: '+7 (900) 111-22-33',
          groupId: '2',
        },
      ];
    }

    if (groupsData) {
      this.groups = JSON.parse(groupsData);
    } else {
      // Демо-данные для групп
      this.groups = [
        { id: '1', name: 'Друзья' },
        { id: '2', name: 'Коллеги' },
      ];
    }

    // Сохраняем демо-данные в localStorage, если их там не было
    if (!contactsData || !groupsData) {
      this.saveData();
    }
  }

  // Сохранение данных в localStorage
  public saveData(): void {
    localStorage.setItem('contacts', JSON.stringify(this.contacts));
    localStorage.setItem('groups', JSON.stringify(this.groups));
  }

  // Получение всех контактов
  public getContacts(): Contact[] {
    return this.contacts;
  }

  // Получение всех групп
  public getGroups(): Group[] {
    return this.groups;
  }

  // Добавление нового контакта
  public addContact(contact: Omit<Contact, 'id'>): void {
    const newContact: Contact = {
      id: Date.now().toString(),
      ...contact,
    };
    this.contacts.push(newContact);
    this.saveData();
  }

  // Обновление контакта
  public updateContact(id: string, data: Partial<Contact>): void {
    const index = this.contacts.findIndex((contact) => contact.id === id);
    if (index !== -1) {
      this.contacts[index] = { ...this.contacts[index], ...data };
      this.saveData();
    }
  }

  // Удаление контакта
  public deleteContact(id: string): void {
    this.contacts = this.contacts.filter((contact) => contact.id !== id);
    this.saveData();
  }

  // Добавление новой группы
  public addGroup(name: string): string {
    const id = Date.now().toString();
    this.groups.push({ id, name });
    this.saveData();
    return id;
  }

  // Обновление группы
  public updateGroup(id: string, name: string): void {
    const index = this.groups.findIndex((group) => group.id === id);
    if (index !== -1) {
      this.groups[index].name = name;
      this.saveData();
    }
  }

  // Удаление группы
  public deleteGroup(id: string): void {
    // Удаляем группу
    this.groups = this.groups.filter((group) => group.id !== id);

    // Удаляем все контакты, связанные с этой группой
    this.contacts = this.contacts.filter((contact) => contact.groupId !== id);

    this.saveData();
  }

  // Получение контактов по группе
  public getContactsByGroup(groupId: string): Contact[] {
    return this.contacts.filter((contact) => contact.groupId === groupId);
  }

  // Получение группы по ID
  public getGroupById(id: string): Group | undefined {
    return this.groups.find((group) => group.id === id);
  }

  // Обновление выпадающего списка групп
  public updateGroupsDropdown(): void {
    const dropdown = document.querySelector('.dropdown__menu');
    if (!dropdown) return;

    dropdown.innerHTML = '';

    this.groups.forEach((group) => {
      const item = document.createElement('li');
      item.className = 'dropdown__item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', group.id);
      item.textContent = group.name;
      dropdown.appendChild(item);
    });

    // Обновляем обработчики событий для выпадающего списка
    this.dropdownManager.initDropdown();
  }

  // Отрисовка всего приложения
  public render(): void {
    const mainContent = document.querySelector('.main__content');
    if (!mainContent) return;

    // Очищаем содержимое
    mainContent.innerHTML = '';

    // Добавляем кнопку добавления контакта
    const addButton = document.createElement('div');
    addButton.className = 'main__button';
    addButton.innerHTML = `
      <button type='button' class="button button_secondary" data-menu="contacts">
        <span>Добавить контакт</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.25 6.75H6.75V11.25H5.25V6.75H0.75V5.25H5.25V0.75H6.75V5.25H11.25V6.75Z" />
        </svg>
      </button>
    `;
    mainContent.appendChild(addButton);

    // Добавляем обработчик для кнопки
    const button = addButton.querySelector('button');
    if (button) {
      button.addEventListener('click', () => {
        this.menuManager.openMenu('contacts');
        this.updateGroupsDropdown();
      });
    }

    // Если нет групп или контактов, показываем сообщение
    if (this.groups.length === 0 || this.contacts.length === 0) {
      const emptyMessage = document.createElement('h2');
      emptyMessage.textContent = 'Список контактов пуст';
      mainContent.appendChild(emptyMessage);
      return;
    }

    // Отрисовываем группы и контакты
    this.groups.forEach((group) => {
      const contacts = this.getContactsByGroup(group.id);

      // Пропускаем пустые группы
      if (contacts.length === 0) return;

      const groupElement = document.createElement('div');
      groupElement.className = 'group';
      groupElement.setAttribute('data-id', group.id);

      groupElement.innerHTML = `
        <div class="group__header group-header">
          <div class="group-header__name">${group.name}</div>
          <div class="group-header__trigger">
            <svg width="13" height="8" viewBox="0 0 13 8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.8849 0.294983L6.29492 4.87498L1.70492 0.294983L0.294922 1.70498L6.29492 7.70498L12.2949 1.70498L10.8849 0.294983Z" />
            </svg>
          </div>
        </div>
        <div class="group__list"></div>
      `;

      mainContent.appendChild(groupElement);

      // Добавляем обработчик для заголовка группы
      const header = groupElement.querySelector('.group__header');
      if (header) {
        header.addEventListener('click', () => {
          groupElement.classList.toggle('group_open');
          const trigger = groupElement.querySelector('.group-header__trigger');
          if (trigger) {
            trigger.classList.toggle('group-header__trigger_open');
          }
        });
      }

      // Отрисовываем контакты в группе
      const list = groupElement.querySelector('.group__list');
      if (!list) return;

      contacts.forEach((contact) => {
        const contactElement = document.createElement('div');
        contactElement.className = 'group__item group-item';
        contactElement.setAttribute('data-id', contact.id);

        contactElement.innerHTML = `
          <div class="group-item__name">${contact.name}</div>
          <div class="group-item__control">
            <div class="group-item__phone">
              <a href="tel:${contact.phone.replace(
                /\D/g,
                ''
              )}" class='group-item__link'>${contact.phone}</a>
            </div>
            <div class="group-item__buttons">
              <button type='button' class="button button_rename">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 14.25V18H3.75L14.81 6.94L11.06 3.19L0 14.25ZM17.71 4.04C18.1 3.65 18.1 3.02 17.71 2.63L15.37 0.289998C14.98 -0.100002 14.35 -0.100002 13.96 0.289998L12.13 2.12L15.88 5.87L17.71 4.04Z" />
                </svg>
              </button>
              <button type='button' class="button button_delete">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" />
                </svg>
              </button>
            </div>
          </div>
        `;

        list.appendChild(contactElement);

        // Добавляем обработчики для кнопок
        const renameButton = contactElement.querySelector('.button_rename');
        if (renameButton) {
          renameButton.addEventListener('click', () => {
            this.contactsManager.startRenameContact(contact.id);
          });
        }

        const deleteButton = contactElement.querySelector('.button_delete');
        if (deleteButton) {
          deleteButton.addEventListener('click', () => {
            if (confirm(`Удалить контакт "${contact.name}"?`)) {
              this.deleteContact(contact.id);
              this.toasterManager.showToaster('Контакт успешно удален');
              this.render();
            }
          });
        }
      });
    });
  }
}

// Класс для валидации
class Validator {
  // Валидация имени
  public validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Имя не может быть пустым');
    } else if (name.trim().length < 2) {
      errors.push('Имя должно содержать минимум 2 символа');
    } else if (name.trim().length > 100) {
      errors.push('Имя не может быть длиннее 100 символов');
    } else if (!/^[а-яёА-ЯЁa-zA-Z\s-]+$/.test(name.trim())) {
      errors.push('Имя может содержать только буквы, пробелы и дефисы');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Валидация телефона
  public validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    const cleanPhone = phone.replace(/\D/g, '');

    if (!phone.trim()) {
      errors.push('Номер телефона не может быть пустым');
    } else if (cleanPhone.length < 10) {
      errors.push('Номер телефона должен содержать минимум 10 цифр');
    } else if (cleanPhone.length > 15) {
      errors.push('Номер телефона не может содержать более 15 цифр');
    } else if (!/^[\d\s\-+()]+$/.test(phone)) {
      errors.push('Номер телефона содержит недопустимые символы');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Валидация названия группы
  public validateGroupName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Название группы не может быть пустым');
    } else if (name.trim().length < 1) {
      errors.push('Название группы должно содержать минимум 1 символ');
    } else if (name.trim().length > 50) {
      errors.push('Название группы не может быть длиннее 50 символов');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Проверка уникальности названия группы
  public validateGroupUniqueness(
    name: string,
    groups: Group[],
    excludeId?: string
  ): ValidationResult {
    const errors: string[] = [];

    const existingGroup = groups.find(
      (group) =>
        group.name.toLowerCase() === name.toLowerCase() &&
        group.id !== excludeId
    );

    if (existingGroup) {
      errors.push('Группа с таким названием уже существует');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Класс для управления меню
class MenuManager {
  private menus: NodeListOf<HTMLElement>;

  constructor() {
    this.menus = document.querySelectorAll('.menu-group');
    this.initEventListeners();
  }

  private initEventListeners(): void {
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Не закрываем меню, если клик был по дропдауну или его элементам
      if (target.closest('.dropdown') || target.closest('.dropdown__item')) {
        return;
      }

      if (!target.closest('.menu-group') && !target.closest('[data-menu]')) {
        this.closeAllMenus();
      }
    });
  }

  public openMenu(menuName: string): void {
    this.closeAllMenus();

    const menu = document.querySelector(
      `.menu-group[data-menu="${menuName}"]`
    ) as HTMLElement;
    if (menu) {
      menu.classList.add('menu-group_open');
      document.body.classList.add('menu-open');
    }
  }

  public closeMenu(menuName: string): void {
    const menu = document.querySelector(
      `.menu-group[data-menu="${menuName}"]`
    ) as HTMLElement;
    if (menu) {
      menu.classList.remove('menu-group_open');
      document.body.classList.remove('menu-open');
    }
  }

  public closeAllMenus(): void {
    this.menus.forEach((menu) => {
      menu.classList.remove('menu-group_open');
    });
    document.body.classList.remove('menu-open');
  }
}

// Класс для управления группами
class GroupsManager {
  private app: ContactBook;
  private validator: Validator;

  constructor(app: ContactBook) {
    this.app = app;
    this.validator = new Validator();
  }

  // Отрисовка групп в меню групп
  public renderGroupsMenu(): void {
    const menuBody = document.querySelector(
      '.menu-group[data-menu="group"] .menu-group__body'
    );
    if (!menuBody) return;

    // Очищаем содержимое
    menuBody.innerHTML = '';

    // Получаем группы из приложения
    const groups = this.app.getGroups();

    // Если групп нет, добавляем пустое поле
    if (groups.length === 0) {
      this.addGroupField();
      return;
    }

    // Отрисовываем существующие группы
    groups.forEach((group) => {
      const item = document.createElement('div');
      item.className = 'menu-group__item';
      item.setAttribute('data-id', group.id);

      item.innerHTML = `
        <input autocomplete="off" type="text" id="group-name-${group.id}" name="groupName_${group.id}" placeholder="Введите название" value="${group.name}" class="input">
        <button type='button' class="button button_delete">
          <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" />
          </svg>
        </button>
      `;

      menuBody.appendChild(item);

      // Добавляем обработчик для кнопки удаления
      const deleteButton = item.querySelector('.button_delete');
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          this.showDeleteConfirmation(group.id);
        });
      }
    });

    // Обновляем обработчики кнопок закрытия после перерисовки
    this.app.setupCloseButtonHandlers();
  }

  // Показать подтверждение удаления группы
  private showDeleteConfirmation(groupId: string): void {
    const group = this.app.getGroupById(groupId);
    if (!group) return;

    const contacts = this.app.getContactsByGroup(groupId);

    // Обновляем текст в попапе
    const popupTitle = document.querySelector('.popup__title');
    const popupText = document.querySelector('.popup__text');

    if (popupTitle) {
      popupTitle.textContent = 'Удалить группу?';
    }

    if (popupText) {
      if (contacts.length > 0) {
        popupText.textContent = `Удаление группы "${group.name}" повлечет за собой удаление ${contacts.length} контакт(ов), связанных с этой группой`;
      } else {
        popupText.textContent = `Вы уверены, что хотите удалить группу "${group.name}"?`;
      }
    }

    // Показываем попап и скрываем меню
    this.app.popupManager.openPopup(groupId);
  }

  public addGroupField(): void {
    const menuBody = document.querySelector(
      '.menu-group[data-menu="group"] .menu-group__body'
    );
    if (!menuBody) return;

    const uniqueId = `new-group-${Date.now()}`;
    const item = document.createElement('div');
    item.className = 'menu-group__item';

    item.innerHTML = `
      <input autocomplete="off" type="text" id="group-name-${uniqueId}" name="groupName_${uniqueId}" placeholder="Введите название" value="" class="input">
      <button type='button' class="button button_delete">
        <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" />
        </svg>
      </button>
    `;

    menuBody.appendChild(item);

    // Добавляем обработчик для кнопки удаления
    const deleteButton = item.querySelector('.button_delete');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        item.remove();
      });
    }

    // Фокусируемся на новом поле
    const input = item.querySelector('input');
    if (input) {
      input.focus();
    }

    // Добавляем обработчик для автоматического сохранения при вводе
    input?.addEventListener('blur', () => {
      if (input.value.trim()) {
        const validation = this.validator.validateGroupName(input.value.trim());
        const uniquenessValidation = this.validator.validateGroupUniqueness(
          input.value.trim(),
          this.app.getGroups()
        );

        if (validation.isValid && uniquenessValidation.isValid) {
          // Если поле не пустое и валидное, создаем новую группу
          const groupId = this.app.addGroup(input.value.trim());
          item.setAttribute('data-id', groupId);

          // Обновляем ID и name инпута
          input.id = `group-name-${groupId}`;
          input.name = `groupName_${groupId}`;

          // Убираем класс ошибки
          input.classList.remove('error');

          // Обновляем выпадающий список групп
          this.app.updateGroupsDropdown();
        } else {
          // Показываем ошибки валидации и добавляем класс ошибки
          const errors = [...validation.errors, ...uniquenessValidation.errors];
          input.classList.add('error');
          alert(errors.join('\n'));
          input.focus();
        }
      }
    });
  }

  public validateAndSaveGroups(): ValidationResult {
    const items = document.querySelectorAll(
      '.menu-group[data-menu="group"] .menu-group__item'
    );
    const groups = this.app.getGroups();
    const allErrors: string[] = [];
    const groupNames: string[] = [];

    console.log(groups);

    // Валидируем все группы
    items.forEach((item, index) => {
      const input = item.querySelector('input') as HTMLInputElement;
      if (!input) return;

      const groupName = input.value.trim();
      if (!groupName) return;

      // Валидация названия группы
      const nameValidation = this.validator.validateGroupName(groupName);
      if (!nameValidation.isValid) {
        allErrors.push(
          `Группа ${index + 1}: ${nameValidation.errors.join(', ')}`
        );
        input.classList.add('error');
        return;
      } else {
        input.classList.remove('error');
      }

      // Проверка на дублирование в текущем списке
      if (groupNames.includes(groupName.toLowerCase())) {
        allErrors.push(`Группа ${index + 1}: Дублирующееся название группы`);
        input.classList.add('error');
        return;
      } else {
        input.classList.remove('error');
      }

      groupNames.push(groupName.toLowerCase());
    });

    if (allErrors.length > 0) {
      return {
        isValid: false,
        errors: allErrors,
      };
    }

    // Если валидация прошла успешно, сохраняем группы
    this.saveGroups();

    return {
      isValid: true,
      errors: [],
    };
  }

  private saveGroups(): void {
    const items = document.querySelectorAll(
      '.menu-group[data-menu="group"] .menu-group__item'
    );
    const groups = this.app.getGroups();

    // Обновляем существующие группы и добавляем новые
    items.forEach((item) => {
      const input = item.querySelector('input') as HTMLInputElement;
      if (!input || !input.value.trim()) return;

      const groupId = item.getAttribute('data-id');

      if (groupId) {
        // Обновляем существующую группу
        this.app.updateGroup(groupId, input.value.trim());
      } else {
        // Добавляем новую группу
        const newGroupId = this.app.addGroup(input.value.trim());
        item.setAttribute('data-id', newGroupId);
      }
    });

    // Проверяем, какие группы были удалены
    const currentGroupIds = Array.from(items)
      .map((item) => item.getAttribute('data-id'))
      .filter((id) => id !== null) as string[];

    const groupsToDelete = groups.filter(
      (group) => !currentGroupIds.includes(group.id)
    );

    // Удаляем группы, которых нет в текущем списке
    groupsToDelete.forEach((group) => {
      this.app.deleteGroup(group.id);
    });
  }

  public deleteGroup(id: string): void {
    this.app.deleteGroup(id);

    // Обновляем меню групп
    this.renderGroupsMenu();

    // Обновляем выпадающий список групп
    this.app.updateGroupsDropdown();
  }
}

// Класс для управления контактами
class ContactsManager {
  private app: ContactBook;
  private activeEditItem: HTMLElement | null = null;
  private validator: Validator;

  constructor(app: ContactBook) {
    this.app = app;
    this.validator = new Validator();
  }

  public validateAndSaveContact(): ValidationResult {
    const nameInput = document.querySelector(
      '#contact-name'
    ) as HTMLInputElement;
    const phoneInput = document.querySelector(
      '#contact-phone'
    ) as HTMLInputElement;
    const groupSelected = document.querySelector(
      '.dropdown__selected'
    ) as HTMLElement;

    if (!nameInput || !phoneInput || !groupSelected) {
      return {
        isValid: false,
        errors: ['Не найдены необходимые поля формы'],
      };
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const groupId = groupSelected.getAttribute('data-value') || '';

    const allErrors: string[] = [];

    // Валидация имени
    const nameValidation = this.validator.validateName(name);
    if (!nameValidation.isValid) {
      allErrors.push(...nameValidation.errors);
      nameInput.classList.add('error');
    } else {
      nameInput.classList.remove('error');
    }

    // Валидация телефона
    const phoneValidation = this.validator.validatePhone(phone);
    if (!phoneValidation.isValid) {
      allErrors.push(...phoneValidation.errors);
      phoneInput.classList.add('error');
    } else {
      phoneInput.classList.remove('error');
    }

    // Проверка выбора группы
    if (!groupId) {
      allErrors.push('Необходимо выбрать группу');
      groupSelected.classList.add('error');
    } else {
      groupSelected.classList.remove('error');
    }

    if (allErrors.length > 0) {
      return {
        isValid: false,
        errors: allErrors,
      };
    }

    // Если валидация прошла успешно, сохраняем контакт
    this.app.addContact({ name, phone, groupId });

    // Очищаем поля
    nameInput.value = '';
    phoneInput.value = '';
    groupSelected.textContent = 'Выберите группу';
    groupSelected.setAttribute('data-value', '');

    return {
      isValid: true,
      errors: [],
    };
  }

  public startRenameContact(id: string): void {
    const contactElement = document.querySelector(
      `.group-item[data-id="${id}"]`
    );
    if (!contactElement) return;

    const nameElement = contactElement.querySelector(
      '.group-item__name'
    ) as HTMLElement;
    if (!nameElement) return;

    // Если уже редактируем другой элемент, завершаем его редактирование
    if (this.activeEditItem && this.activeEditItem !== contactElement) {
      this.finishRenameContact();
    }

    // Создаем поле ввода
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'group-item__name-input';
    input.value = nameElement.textContent || '';
    input.id = `edit-contact-${id}`;

    // Сохраняем текущее имя для возможной отмены
    contactElement.setAttribute(
      'data-original-name',
      nameElement.textContent || ''
    );

    // Заменяем текст на поле ввода
    nameElement.innerHTML = '';
    nameElement.appendChild(input);

    // Устанавливаем фокус на поле ввода
    input.focus();
    input.select();

    // Устанавливаем класс редактирования
    contactElement.classList.add('group-item_editing');

    // Запоминаем редактируемый элемент
    this.activeEditItem = contactElement as HTMLElement;

    // Добавляем обработчики событий
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.finishRenameContact();
      } else if (e.key === 'Escape') {
        this.cancelRenameContact();
      }
    });

    // Обработчик клика вне элемента
    document.addEventListener('click', this.handleOutsideClick);
  }

  private handleOutsideClick = (e: MouseEvent): void => {
    if (
      this.activeEditItem &&
      !this.activeEditItem.contains(e.target as Node)
    ) {
      this.finishRenameContact();
      document.removeEventListener('click', this.handleOutsideClick);
    }
  };

  private finishRenameContact(): void {
    if (!this.activeEditItem) return;

    const input = this.activeEditItem.querySelector(
      'input'
    ) as HTMLInputElement;
    if (!input) return;

    const newName = input.value.trim();
    const contactId = this.activeEditItem.getAttribute('data-id');
    const nameElement = this.activeEditItem.querySelector(
      '.group-item__name'
    ) as HTMLElement;

    if (newName && contactId) {
      // Валидация нового имени
      const validation = this.validator.validateName(newName);

      if (validation.isValid) {
        // Обновляем имя контакта
        this.app.updateContact(contactId, { name: newName });

        // Обновляем отображение
        nameElement.textContent = newName;

        // Убираем класс ошибки если он был
        input.classList.remove('error');
      } else {
        // Показываем ошибки валидации и добавляем класс ошибки
        input.classList.add('error');
        alert(validation.errors.join('\n'));

        // Возвращаем исходное имя
        const originalName =
          this.activeEditItem.getAttribute('data-original-name') || '';
        nameElement.textContent = originalName;
      }
    } else {
      // Если имя пустое, возвращаем исходное
      const originalName =
        this.activeEditItem.getAttribute('data-original-name') || '';
      nameElement.textContent = originalName;
    }

    // Удаляем класс редактирования
    this.activeEditItem.classList.remove('group-item_editing');

    // Очищаем активный элемент
    this.activeEditItem = null;

    // Удаляем обработчик клика
    document.removeEventListener('click', this.handleOutsideClick);
  }

  private cancelRenameContact(): void {
    if (!this.activeEditItem) return;

    const nameElement = this.activeEditItem.querySelector(
      '.group-item__name'
    ) as HTMLElement;

    // Возвращаем исходное имя
    const originalName =
      this.activeEditItem.getAttribute('data-original-name') || '';
    nameElement.textContent = originalName;

    // Удаляем класс редактирования
    this.activeEditItem.classList.remove('group-item_editing');

    // Очищаем активный элемент
    this.activeEditItem = null;

    // Удаляем обработчик клика
    document.removeEventListener('click', this.handleOutsideClick);
  }
}

// Класс для управления выпадающим списком
class DropdownManager {
  private dropdown: HTMLElement | null = null;
  private toggle: HTMLElement | null = null;
  private menu: HTMLElement | null = null;
  private selected: HTMLElement | null = null;
  private isOpen = false;

  constructor() {
    this.initDropdown();
  }

  public initDropdown(): void {
    this.dropdown = document.getElementById('dropdown');
    if (!this.dropdown) return;

    this.toggle = this.dropdown.querySelector('.dropdown__toggle');
    this.menu = this.dropdown.querySelector('.dropdown__menu');
    this.selected = this.dropdown.querySelector('.dropdown__selected');

    if (!this.toggle || !this.menu || !this.selected) return;

    // Удаляем старые обработчики
    this.toggle.removeEventListener('click', this.toggleDropdown);

    // Добавляем новые обработчики
    this.toggle.addEventListener('click', this.toggleDropdown);

    // Обработчики для элементов выпадающего списка
    const items = this.menu.querySelectorAll('.dropdown__item');
    items.forEach((item) => {
      item.removeEventListener('click', this.handleItemClick);
      item.addEventListener('click', this.handleItemClick);
    });

    // Закрытие при клике вне выпадающего списка
    document.addEventListener('click', this.handleOutsideClick);
  }

  private toggleDropdown = (e: Event): void => {
    e.stopPropagation(); // Предотвращаем всплытие события

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  };

  private openDropdown = (): void => {
    if (!this.dropdown || !this.toggle || !this.menu) return;

    this.dropdown.classList.add('dropdown_open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
  };

  private closeDropdown = (): void => {
    if (!this.dropdown || !this.toggle) return;

    this.dropdown.classList.remove('dropdown_open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
  };

  private handleItemClick = (e: Event): void => {
    e.stopPropagation(); // Предотвращаем всплытие события

    if (!this.selected) return;

    const item = e.currentTarget as HTMLElement;
    const value = item.getAttribute('data-value') || '';
    const text = item.textContent || '';

    this.selected.textContent = text;
    this.selected.setAttribute('data-value', value);

    this.closeDropdown();
  };

  private handleOutsideClick = (e: MouseEvent): void => {
    if (
      this.dropdown &&
      !this.dropdown.contains(e.target as Node) &&
      this.isOpen
    ) {
      this.closeDropdown();
    }
  };
}

// Класс для управления всплывающими окнами
class PopupManager {
  private popup: HTMLElement | null = null;
  private targetId = '';
  private menuManager: MenuManager;
  private groupsManager: GroupsManager;

  constructor(menuManager: MenuManager, groupsManager: GroupsManager) {
    this.popup = document.getElementById('reanswer');
    this.menuManager = menuManager;
    this.groupsManager = groupsManager;
    this.initEventListeners();
  }

  private initEventListeners(): void {
    // Обработчик для подтверждения удаления группы
    const confirmDeleteButton = document.querySelector(
      '.popup-buttons .button_primary'
    );
    if (confirmDeleteButton) {
      confirmDeleteButton.addEventListener('click', () => {
        if (this.targetId) {
          this.groupsManager.deleteGroup(this.targetId);
          this.closePopup();

          // Показываем тостер
          const toasterManager = new ToasterManager();
          toasterManager.showToaster('Группа успешно удалена');

          // Открываем боковое меню групп
          this.menuManager.openMenu('group');
        }
      });
    }

    // Обработчик для отмены удаления группы
    const cancelDeleteButton = document.querySelector(
      '.popup-buttons .button_transparent'
    );
    if (cancelDeleteButton) {
      cancelDeleteButton.addEventListener('click', () => {
        this.closePopup();
        // Открываем боковое меню групп
        this.menuManager.openMenu('group');
      });
    }
  }

  public openPopup(targetId: string): void {
    if (!this.popup) return;

    this.targetId = targetId;

    // Оставляем оверлэй, но скрываем содержимое меню
    const openMenu = document.querySelector('.menu-group_open');
    if (openMenu) {
      openMenu.classList.add('menu-group_hidden');
    }

    // Затем показываем попап
    this.popup.classList.add('popup_open');
    document.body.classList.add('popup-open');
  }

  public closePopup(): void {
    if (!this.popup) return;

    this.popup.classList.remove('popup_open');
    document.body.classList.remove('popup-open');
    this.targetId = '';

    // Показываем содержимое меню обратно
    const hiddenMenu = document.querySelector('.menu-group_hidden');
    if (hiddenMenu) {
      hiddenMenu.classList.remove('menu-group_hidden');
    }
  }

  public getTargetId(): string {
    return this.targetId;
  }
}

// Класс для управления уведомлениями
class ToasterManager {
  private toaster: HTMLElement | null = null;
  private toasterText: HTMLElement | null = null;
  private timeout: number | null = null;

  constructor() {
    this.toaster = document.querySelector('.toster');
    this.toasterText = document.querySelector('.toster__text');
  }

  public showToaster(message: string, duration = 3000): void {
    if (!this.toaster || !this.toasterText) return;

    // Устанавливаем текст
    this.toasterText.textContent = message;

    // Показываем уведомление
    this.toaster.classList.add('toster_show');

    // Очищаем предыдущий таймер, если он есть
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }

    // Устанавливаем новый таймер
    this.timeout = window.setTimeout(() => {
      this.hideToaster();
    }, duration);
  }

  private hideToaster(): void {
    if (!this.toaster) return;

    this.toaster.classList.remove('toster_show');
    this.timeout = null;
  }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const app = new ContactBook();

  console.log(app);

  // Обновляем HTML для добавления уникальных ID к инпутам
  const contactNameInput = document.querySelector(
    '.menu-group[data-menu="contacts"] input[placeholder="Введите ФИО"]'
  ) as HTMLInputElement;
  const contactPhoneInput = document.querySelector(
    '.menu-group[data-menu="contacts"] input[placeholder="Введите номер"]'
  ) as HTMLInputElement;

  if (contactNameInput) {
    contactNameInput.id = 'contact-name';
    contactNameInput.name = 'contactName';
  }

  if (contactPhoneInput) {
    contactPhoneInput.id = 'contact-phone';
    contactPhoneInput.name = 'contactPhone';
  }
});
