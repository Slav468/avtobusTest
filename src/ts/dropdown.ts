export default class CustomDropdown {
  private dropdown: HTMLElement;
  private toggleButton: HTMLElement;
  private selectedText: HTMLElement;
  private dropdownMenu: HTMLElement;
  private dropdownItems: NodeListOf<HTMLElement>;
  private isOpen: boolean = false;
  private selectedValue: string | null = null;
  private selectedIndex: number = -1;

  constructor(dropdownId: string) {
    // Initialize DOM elements
    this.dropdown = document.getElementById(dropdownId) as HTMLElement;
    this.toggleButton = this.dropdown.querySelector(
      '.dropdown__toggle'
    ) as HTMLElement;
    this.selectedText = this.dropdown.querySelector(
      '.dropdown__selected'
    ) as HTMLElement;
    this.dropdownMenu = this.dropdown.querySelector(
      '.dropdown__menu'
    ) as HTMLElement;
    this.dropdownItems = this.dropdown.querySelectorAll(
      '.dropdown__item'
    ) as NodeListOf<HTMLElement>;

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Toggle dropdown on button click
    this.toggleButton.addEventListener('click', () => this.toggleDropdown());

    // Handle item selection
    this.dropdownItems.forEach((item, index) => {
      item.addEventListener('click', () => this.selectItem(item, index));
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target as Node) && this.isOpen) {
        this.closeDropdown();
      }
    });

    // Keyboard navigation
    this.dropdown.addEventListener('keydown', (e) =>
      this.handleKeyboardNavigation(e)
    );
  }

  private toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private openDropdown(): void {
    this.dropdown.classList.add('open');
    this.toggleButton.setAttribute('aria-expanded', 'true');
    this.isOpen = true;

    // If an item is selected, scroll to it
    if (this.selectedIndex >= 0) {
      const selectedItem = this.dropdownItems[this.selectedIndex];
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  private closeDropdown(): void {
    this.dropdown.classList.remove('open');
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
  }

  private selectItem(item: HTMLElement, index: number): void {
    // Remove selected class from all items
    this.dropdownItems.forEach((i) => i.classList.remove('selected'));

    // Add selected class to clicked item
    item.classList.add('selected');

    // Update selected text and value
    const text = item?.textContent || 'Выберите опцию';
    const value = item.getAttribute('data-value');

    this.selectedText.textContent = text;
    this.selectedValue = value;
    this.selectedIndex = index;

    // Close the dropdown
    this.closeDropdown();
  }

  private handleKeyboardNavigation(e: KeyboardEvent): void {
    // Only handle keyboard navigation when dropdown is open or when opening with arrow keys
    if (
      !this.isOpen &&
      e.key !== 'ArrowDown' &&
      e.key !== 'ArrowUp' &&
      e.key !== 'Enter' &&
      e.key !== ' '
    ) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        this.closeDropdown();
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.navigateItems(1);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.navigateItems(-1);
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else if (this.selectedIndex >= 0) {
          this.selectItem(
            this.dropdownItems[this.selectedIndex],
            this.selectedIndex
          );
        }
        break;

      case 'Tab':
        if (this.isOpen) {
          this.closeDropdown();
        }
        break;
    }
  }

  private navigateItems(direction: number): void {
    const itemCount = this.dropdownItems.length;
    let newIndex = this.selectedIndex + direction;

    // Handle wrapping
    if (newIndex < 0) {
      newIndex = itemCount - 1;
    } else if (newIndex >= itemCount) {
      newIndex = 0;
    }

    // Remove selected class from all items
    this.dropdownItems.forEach((item) => item.classList.remove('selected'));

    // Add selected class to new item
    const newSelectedItem = this.dropdownItems[newIndex];
    newSelectedItem.classList.add('selected');

    // Update selected index
    this.selectedIndex = newIndex;

    // Scroll to the item
    newSelectedItem.scrollIntoView({ block: 'nearest' });
  }
}
