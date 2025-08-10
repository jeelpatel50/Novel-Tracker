// Novel Tracker Application JavaScript

class NovelTracker {
    constructor() {
        this.novels = [];
        this.settings = {
            email: '',
            dailyCheckTime: '08:00',
            notificationsEnabled: true
        };
        this.notifications = [];
        this.currentView = 'dashboard';
        this.currentNovelId = null;
        this.modalConfirmCallback = null;
        
        // Initialize immediately
        this.initializeData();
        this.bindEvents();
        this.showView('dashboard');
    }

    // Initialize with sample data
    initializeData() {
        this.novels = [
            {
                id: 1,
                title: "Overgeared",
                url: "https://example.com/overgeared",
                currentChapter: 2156,
                userProgress: 1400,
                milestoneIncrement: 50,
                milestoneTarget: 1450,
                status: "active",
                lastChecked: "2025-08-10T06:00:00Z"
            },
            {
                id: 2,
                title: "Solo Leveling",
                url: "https://example.com/solo-leveling",
                currentChapter: 270,
                userProgress: 245,
                milestoneIncrement: 25,
                milestoneTarget: 270,
                status: "completed",
                lastChecked: "2025-08-10T06:00:00Z"
            },
            {
                id: 3,
                title: "The Beginning After The End",
                url: "https://example.com/tbate",
                currentChapter: 478,
                userProgress: 380,
                milestoneIncrement: 30,
                milestoneTarget: 410,
                status: "active",
                lastChecked: "2025-08-10T06:00:00Z"
            }
        ];

        this.settings = {
            email: "user@gmail.com",
            dailyCheckTime: "08:00",
            notificationsEnabled: true
        };

        this.notifications = [
            {
                id: 1,
                message: "Milestone reached for Solo Leveling! Chapter 270 available.",
                timestamp: "2025-08-09T08:00:00Z",
                type: "milestone",
                read: false
            },
            {
                id: 2,
                message: "New chapters available for Overgeared (5 new chapters)",
                timestamp: "2025-08-08T08:00:00Z",
                type: "update",
                read: false
            }
        ];
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                this.showView(view);
            });
        });

        // Dashboard buttons
        const addNovelBtn = document.getElementById('add-novel-btn');
        if (addNovelBtn) {
            addNovelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('add-novel');
            });
        }

        // Back buttons
        this.bindBackButtons();

        // Forms
        this.bindForms();

        // Search and Filter
        const searchInput = document.getElementById('search-novels');
        const filterSelect = document.getElementById('filter-status');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterNovels());
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterNovels());
        }

        // Settings actions
        this.bindSettingsActions();

        // Notifications actions
        this.bindNotificationActions();

        // Modal
        this.bindModalEvents();
    }

    bindBackButtons() {
        const backButtons = [
            { id: 'back-to-dashboard', view: 'dashboard' },
            { id: 'back-from-detail', view: 'dashboard' },
            { id: 'back-from-settings', view: 'dashboard' },
            { id: 'back-from-notifications', view: 'dashboard' }
        ];

        backButtons.forEach(button => {
            const element = document.getElementById(button.id);
            if (element) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showView(button.view);
                });
            }
        });
    }

    bindForms() {
        const addNovelForm = document.getElementById('add-novel-form');
        if (addNovelForm) {
            addNovelForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddNovel();
            });
        }

        const updateProgressForm = document.getElementById('update-progress-form');
        if (updateProgressForm) {
            updateProgressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateProgress();
            });
        }

        const updateMilestoneForm = document.getElementById('update-milestone-form');
        if (updateMilestoneForm) {
            updateMilestoneForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateMilestone();
            });
        }

        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveSettings();
            });
        }
    }

    bindSettingsActions() {
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data');
        const importFile = document.getElementById('import-file');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                if (importFile) importFile.click();
            });
        }
        if (importFile) {
            importFile.addEventListener('change', (e) => this.handleImportData(e));
        }
    }

    bindNotificationActions() {
        const markAllBtn = document.getElementById('mark-all-read');
        const clearBtn = document.getElementById('clear-notifications');

        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => this.markAllNotificationsRead());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllNotifications());
        }
    }

    bindModalEvents() {
        const modalCancel = document.getElementById('modal-cancel');
        const modalConfirm = document.getElementById('modal-confirm');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        const deleteBtn = document.getElementById('delete-novel-btn');

        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.hideModal());
        }
        if (modalConfirm) {
            modalConfirm.addEventListener('click', () => this.handleModalConfirm());
        }
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', () => this.hideModal());
        }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.confirmDeleteNovel());
        }
    }

    // View Management
    showView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            }
        });

        // Show/hide views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = viewName;

        // Load view-specific data
        if (viewName === 'dashboard') {
            this.updateDashboardStats();
            this.renderNovels();
        } else if (viewName === 'settings') {
            this.loadSettings();
        } else if (viewName === 'notifications') {
            this.renderNotifications();
        }
    }

    // Novel Management
    handleAddNovel() {
        const title = document.getElementById('novel-title').value.trim();
        const url = document.getElementById('novel-url').value.trim();
        const currentChapter = parseInt(document.getElementById('current-chapter').value);
        const userProgress = parseInt(document.getElementById('user-progress').value);
        const milestoneIncrement = parseInt(document.getElementById('milestone-increment').value);
        
        if (!title || !url || !currentChapter || isNaN(userProgress) || !milestoneIncrement) {
            alert('Please fill in all required fields');
            return;
        }

        const novel = {
            id: Date.now(),
            title,
            url,
            currentChapter,
            userProgress,
            milestoneIncrement,
            milestoneTarget: userProgress + milestoneIncrement,
            status: 'active',
            lastChecked: new Date().toISOString()
        };

        this.novels.push(novel);
        this.addNotification(`Added new novel: ${novel.title}`, 'update');
        
        // Reset form
        document.getElementById('add-novel-form').reset();
        this.showView('dashboard');
    }

    showNovelDetail(novelId) {
        const novel = this.novels.find(n => n.id === novelId);
        if (!novel) return;

        this.currentNovelId = novelId;
        
        // Populate detail view
        document.getElementById('detail-novel-title').textContent = novel.title;
        document.getElementById('detail-current-chapter').textContent = novel.currentChapter;
        document.getElementById('detail-user-progress').textContent = novel.userProgress;
        document.getElementById('detail-milestone').textContent = novel.milestoneTarget;
        
        // Calculate progress percentage
        const progressPercent = (novel.userProgress / novel.currentChapter) * 100;
        const milestonePercent = (novel.milestoneTarget / novel.currentChapter) * 100;
        
        document.getElementById('progress-percentage').textContent = `${progressPercent.toFixed(1)}%`;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
        document.getElementById('milestone-marker').style.left = `${Math.min(milestonePercent, 100)}%`;
        document.getElementById('progress-latest').textContent = `Chapter ${novel.currentChapter}`;
        
        // Populate forms
        document.getElementById('new-progress').value = novel.userProgress;
        document.getElementById('new-current-chapter').value = novel.currentChapter;
        document.getElementById('new-milestone-increment').value = novel.milestoneIncrement;
        
        this.showView('novel-detail');
    }

    handleUpdateProgress() {
        const novel = this.novels.find(n => n.id === this.currentNovelId);
        if (!novel) return;

        const newProgress = parseInt(document.getElementById('new-progress').value);
        const newCurrentChapter = parseInt(document.getElementById('new-current-chapter').value);
        
        if (isNaN(newProgress) || isNaN(newCurrentChapter)) {
            alert('Please enter valid numbers');
            return;
        }

        const oldProgress = novel.userProgress;
        novel.userProgress = newProgress;
        novel.currentChapter = newCurrentChapter;
        novel.lastChecked = new Date().toISOString();
        
        // Check if milestone reached
        if (newProgress >= novel.milestoneTarget && oldProgress < novel.milestoneTarget) {
            this.addNotification(`Milestone reached for ${novel.title}! You've read ${newProgress} chapters.`, 'milestone');
            novel.milestoneTarget += novel.milestoneIncrement;
        }
        
        this.showNovelDetail(this.currentNovelId);
        alert('Progress updated successfully!');
    }

    handleUpdateMilestone() {
        const novel = this.novels.find(n => n.id === this.currentNovelId);
        if (!novel) return;

        const newIncrement = parseInt(document.getElementById('new-milestone-increment').value);
        if (isNaN(newIncrement) || newIncrement <= 0) {
            alert('Please enter a valid milestone increment');
            return;
        }

        novel.milestoneIncrement = newIncrement;
        novel.milestoneTarget = novel.userProgress + newIncrement;
        
        this.showNovelDetail(this.currentNovelId);
        alert('Milestone settings updated successfully!');
    }

    confirmDeleteNovel() {
        const novel = this.novels.find(n => n.id === this.currentNovelId);
        if (!novel) return;

        this.showModal(
            'Delete Novel',
            `Are you sure you want to delete "${novel.title}"? This action cannot be undone.`,
            () => {
                this.novels = this.novels.filter(n => n.id !== this.currentNovelId);
                this.addNotification(`Deleted novel: ${novel.title}`, 'update');
                this.showView('dashboard');
            }
        );
    }

    // Dashboard
    updateDashboardStats() {
        const totalNovels = this.novels.length;
        const totalChapters = this.novels.reduce((sum, novel) => sum + novel.userProgress, 0);
        const milestonesAchieved = this.notifications.filter(n => n.type === 'milestone').length;
        const pendingMilestones = this.novels.filter(novel => 
            novel.currentChapter >= novel.milestoneTarget && novel.userProgress < novel.milestoneTarget
        ).length;

        document.getElementById('total-novels').textContent = totalNovels;
        document.getElementById('total-chapters').textContent = totalChapters;
        document.getElementById('milestones-achieved').textContent = milestonesAchieved;
        document.getElementById('pending-milestones').textContent = pendingMilestones;
    }

    renderNovels() {
        const container = document.getElementById('novels-grid');
        const searchInput = document.getElementById('search-novels');
        const filterSelect = document.getElementById('filter-status');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilter = filterSelect ? filterSelect.value : 'all';
        
        let filteredNovels = this.novels.filter(novel => {
            const matchesSearch = novel.title.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'milestone-reached' && novel.currentChapter >= novel.milestoneTarget && novel.userProgress < novel.milestoneTarget) ||
                novel.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        if (filteredNovels.length === 0) {
            container.innerHTML = '<div class="empty-state">No novels found. Add your first novel to get started!</div>';
            return;
        }

        container.innerHTML = filteredNovels.map(novel => {
            const progressPercent = (novel.userProgress / novel.currentChapter) * 100;
            const milestoneReady = novel.currentChapter >= novel.milestoneTarget && novel.userProgress < novel.milestoneTarget;
            const milestonePercent = (novel.milestoneTarget / novel.currentChapter) * 100;
            
            return `
                <div class="novel-card ${milestoneReady ? 'milestone-ready' : ''}" onclick="app.showNovelDetail(${novel.id})">
                    <div class="novel-title">${novel.title}</div>
                    <div class="novel-stats">
                        <div class="novel-stat">
                            <div class="novel-stat-number">${novel.currentChapter}</div>
                            <div class="novel-stat-label">Latest</div>
                        </div>
                        <div class="novel-stat">
                            <div class="novel-stat-number">${novel.userProgress}</div>
                            <div class="novel-stat-label">Read</div>
                        </div>
                        <div class="novel-stat">
                            <div class="novel-stat-number">${novel.milestoneTarget}</div>
                            <div class="novel-stat-label">Milestone</div>
                        </div>
                    </div>
                    <div class="novel-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            <div class="milestone-marker" style="left: ${Math.min(milestonePercent, 100)}%"></div>
                        </div>
                    </div>
                    <div class="novel-status">
                        <span class="status-badge ${milestoneReady ? 'milestone' : novel.status}">
                            ${milestoneReady ? 'Milestone Ready' : novel.status}
                        </span>
                        <span class="novel-stat-label">${progressPercent.toFixed(1)}% complete</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterNovels() {
        this.renderNovels();
    }

    // Settings
    loadSettings() {
        const emailInput = document.getElementById('gmail-address');
        const timeInput = document.getElementById('check-time');
        const notifCheckbox = document.getElementById('notifications-enabled');
        
        if (emailInput) emailInput.value = this.settings.email;
        if (timeInput) timeInput.value = this.settings.dailyCheckTime;
        if (notifCheckbox) notifCheckbox.checked = this.settings.notificationsEnabled;
    }

    handleSaveSettings() {
        const emailInput = document.getElementById('gmail-address');
        const timeInput = document.getElementById('check-time');
        const notifCheckbox = document.getElementById('notifications-enabled');
        
        this.settings.email = emailInput ? emailInput.value : '';
        this.settings.dailyCheckTime = timeInput ? timeInput.value : '08:00';
        this.settings.notificationsEnabled = notifCheckbox ? notifCheckbox.checked : true;
        
        this.addNotification('Settings saved successfully', 'update');
        alert('Settings saved successfully!');
    }

    // Notifications
    addNotification(message, type = 'update') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.notifications.unshift(notification);
    }

    renderNotifications() {
        const container = document.getElementById('notifications-list');
        
        if (this.notifications.length === 0) {
            container.innerHTML = '<div class="empty-state">No notifications yet.</div>';
            return;
        }

        container.innerHTML = this.notifications.map(notification => {
            const date = new Date(notification.timestamp);
            const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            return `
                <div class="notification-item ${!notification.read ? 'unread' : ''}">
                    <div class="notification-header">
                        <span class="notification-type ${notification.type}">${notification.type}</span>
                        <span class="notification-time">${timeStr}</span>
                    </div>
                    <div class="notification-message">${notification.message}</div>
                </div>
            `;
        }).join('');
    }

    markAllNotificationsRead() {
        this.notifications.forEach(n => n.read = true);
        this.renderNotifications();
        alert('All notifications marked as read');
    }

    clearAllNotifications() {
        this.showModal(
            'Clear Notifications',
            'Are you sure you want to clear all notifications?',
            () => {
                this.notifications = [];
                this.renderNotifications();
                alert('All notifications cleared');
            }
        );
    }

    // Data Import/Export
    exportData() {
        const data = {
            novels: this.novels,
            settings: this.settings,
            notifications: this.notifications,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'novel-tracker-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.addNotification('Data exported successfully', 'update');
        alert('Data exported successfully!');
    }

    handleImportData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.novels && Array.isArray(data.novels)) {
                    this.novels = data.novels;
                }
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                if (data.notifications && Array.isArray(data.notifications)) {
                    this.notifications = data.notifications;
                }
                
                this.addNotification('Data imported successfully', 'update');
                this.showView('dashboard');
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        reader.readAsText(file);
    }

    // Modal Management
    showModal(title, message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (modal) modal.classList.remove('hidden');
        
        this.modalConfirmCallback = onConfirm;
    }

    hideModal() {
        const modal = document.getElementById('confirm-modal');
        if (modal) modal.classList.add('hidden');
        this.modalConfirmCallback = null;
    }

    handleModalConfirm() {
        if (this.modalConfirmCallback) {
            this.modalConfirmCallback();
        }
        this.hideModal();
    }
}

// Initialize the application when DOM is loaded
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new NovelTracker();
    });
} else {
    app = new NovelTracker();
}

console.log('Novel Tracker script loaded successfully!');