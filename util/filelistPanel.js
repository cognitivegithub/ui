
/**
 * Компонент для просмотра списка.
 * Параметры:
 *
 *   items — дополнительные элементы. Отображаются перед списком файлов.
 *
 *   files — массив объектов метаданных о файлах, которые необходимо отобразить
 *   изначально. Метаданные такие:
 *     name — имя файла
 *     descr — описание файла
 *     link — ссылка на файл
 *     size — размер файла
 *     hash - контрольная сумма по ГОСТ Р ИСО
 *
 * Методы:
 *
 * addFileInfo(f) — добавить в список информацию о файле.
 *
 *
 * setValues(v) — заполняет компонент значениями из массива v, массива метаданных
 * файлов.
 *
 */

Ext.define('Application.components.filelistPanel', {
  extend: 'Ext.form.FieldSet',

  /**
   * @cfg {Array} files
   * Массив объектов метаданных о файлах или подзаголовков списка, которые необходимо отобразить изначально.
   * Свойства передаваемых объектов:
   *   name  — имя файла
   *   descr — описание файла
   *   link  — ссылка на файл
   *   size  — размер файла
   *   hash - контрольная сумма по ГОСТ Р ИСО
   *   subheader - подзаголовок списка (если установлен, другие параметры - name, descr, ... - игнорируются)
   */

  //files: [],
  initComponent: function() {
    var uploaded_files_id = Ext.id(),
        empty_panel_id = Ext.id();
    this.filePanelId = uploaded_files_id;
    this.empty_panel_id = empty_panel_id;
    this.linkListId = Ext.id();
    var fileitems = [];

    if ( Ext.isEmpty(this.files) )
      this.files = [];
    if ( Ext.isEmpty(this.withHash)) {
      this.withHash = true;
    }

    for (var i=0; i<this.files.length; i++) {
      if (!this.files[i].subheader) {
        fileitems.push(this.getFileInfoPanel(this.files[i],this.withHash));
      } else {
        fileitems.push({
          border: false,
          cls: 'spaced-bottom-shallow',
          html: '<b>' + this.files[i].subheader + '</b>'
        });
      }
    }
    this.totalFiles = this.files.length;
    this.linkListHidden = this.totalFiles<=3;

    var items = [];
    if (this.items) {
      //items.push.apply(items, this.items);
      Ext.apply(items, this.items);
    }

    if (!this.files.length) {
      fileitems.push({
        border: false,
        html: 'Список пуст',
        id: this.empty_panel_id
      });
    }

    items.push({
      xtype: 'panel',
      border: false,
      id: uploaded_files_id,
      items: fileitems
    });

    this.items = items;

    this.buttons = [{
      text: 'Получить ссылки на файлы',
      id: this.linkListId,
      hidden: this.linkListHidden,
      handler: this.getFilesLinks,
      scope: this
    }];

    Application.components.filelistPanel.superclass.initComponent.call(this);
  },

  /**
   * Добавить в список информацию о файле.
   * @param {Object} file Объект с метаданными файла, содержит свойства:
   *   name  — имя файла
   *   descr — описание файла
   *   link  — ссылка на файл
   *   size  — размер файла
   * @return {Application.components.filelistPanel} this
   */
  addFileInfo: function(file) {
    var panel = Ext.getCmp(this.filePanelId);
    panel.remove(this.empty_panel_id, true);
    this.files.push(file);
    if (!file.subheader) {
      panel.add(this.getFileInfoPanel(file));
    } else {
      panel.add({
        border: false,
        cls: 'spaced-bottom-shallow',
        html: '<b>' + file.subheader + '</b>'
      });
    }

    this.totalFiles++;
    if (this.linkListHidden && this.totalFiles>3) {
      Ext.getCmp(this.linkListId).show();
      this.linkListHidden = false;
    }
    panel.doLayout();
    return this;
  },

  getFilesLinks: function() {
    var links = [];
    for (var i=0; i<this.files.length; i++) {
      if (!this.files[i].link) {
        continue;
      }
      var l = this.files[i].link;
      if (!/^http(s)?:\/\//.test(l)) {
        l = Main.app.baseUrl+(0==l.indexOf('/')?'':'/')+l;
      }
      if (this.files[i].key) {
        l += (l.indexOf('?')<0?'?':'&') + 'key='+this.files[i].key;
      }
      links.push(l);
    }
    links = links.join('\n');
    var win = new Ext.Window({
      title: 'Ссылки на файлы',
      layout: 'anchor',
      width: 800,
      height: 500,
      frame: true,
      cls: 'x-panel-mc',
      plugins: [Ext.ux.plugins.LimitSize],
      defaults: {
        border: false
      },
      items: [{
        xtype: 'panel',
        style: 'padding: 5px 2px;',
        height: 30,
        anchor: '100%',
        html: 'Вы можете скопировать список ссылок на файлы в программу для автоматизированного скачивания'
      }, {
        xtype: 'textarea',
        autoHeight: false,
        readOnly: true,
        anchor: '100% -30',
        value: links,
        listeners: {
          render: function() {
            var field = this.getEl();
            field.on('click', function(){
              field.dom.focus();
              field.dom.select();
            });
          }
        }
      }],
      buttons: [{
        iconCls: 'icon-silk-page_copy',
        text: 'Скопировать ссылки в буфер обмена',
        plugins: [Ext.ux.plugins.Clipboard],
        clipboardText: links,
        handler: Ext.emptyFn
      }, {
        text: 'Закрыть',
        handler: function() {
          win.close();
        }
      }]
    });
    win.show();
  },

  getFileInfoPanel: function(file) {
    return getFileInfoPanel(file, {deleteHandler: false}, this.withHash);
  },

  /**
   * Заполняет компонент значениями из массива с объектами, содержащими
   * метаданные файлов.
   * @param {Array} v Массив файлов.
   */
  setValues: function(v) {
    if (!v) {
      return;
    }
    for (var i=0; i<v.length; i++) {
      this.addFileInfo(v[i])
    }
  }
});
