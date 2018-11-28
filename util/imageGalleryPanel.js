
/**
 * Компонент для работы с галереей изображений.
 * Параметры:
 *
 * items — дополнительные элементы. Отображаются перед списком файлов.
 *
 * files — массив объектов метаданных о файлах, которые необходимо отобразить
 * изначально. Метаданные такие:
 *     name — имя файла
 *     descr — описание файла
 *     thumbLink - ссылка на файл thumbnail
 *     fullLink - ссылка на файл в максимальном отображаемом внутри системы размере     
 *     link — ссылка на файл
 *     size — размер файла
 *     hash - контрольная сумма по ГОСТ Р ИСО
 *
 * Методы:
 *
 * addFileInfo(f) — добавить в галерею информацию об изображении.
 *
 *
 * setValues(v) — заполняет компонент значениями из массива v, массива метаданных
 * файлов.
 *
 */

Ext.define('Application.components.imageGalleryPanel', {
  extend: 'Ext.Panel',

  /**
   * @cfg {Array} files
   * Массив объектов метаданных о файлах или подзаголовков списка, которые необходимо отобразить изначально.
   * Свойства передаваемых объектов:
   *   name  — имя файла
   *   descr — описание файла
   *   link  — ссылка на файл в полном размере
   *   thumbLink - ссылка на файл thumbnail
   *   fullLink - ссылка на файл в максимальном отображаемом внутри системы размере
   *   size  — размер файла
   *   hash - контрольная сумма по ГОСТ Р ИСО
   */

  //files: [],
  initComponent: function() {
    var gallery_id = Ext.id(), upload_panel_id=Ext.id(), single_image_id=Ext.id();
    this.filePanelId = gallery_id;
    
    this.addEvents('uploadcomplete', 'idchanged', 'itemsLoaded');
    
    this.fileitems = [];

    if ( Ext.isEmpty(this.files) )
      this.files = [];

    if ( Ext.isEmpty(this.withHash)) {
      this.withHash = false;
    }
    
    
    var items = [];
    if(this.procedure) {
      this.procedure_id = this.procedure;
    } else {
      if(!this.parent.procedure_id || Ext.isEmpty(this.parent.procedure_id)) {
        this.procedure_id=false;
      } else {
        this.procedure_id = this.parent.procedure_id;
      }
    }
    
    if(this.editable) {
      var uploadPanel = new Application.components.imgUploadForm({
        id: upload_panel_id,
        parent: this,
        procedure_id: this.procedure_id,
        region: 'north',
        height: 165,
        title: 'Добавить фотографию или изображение'
      });
      items.push(uploadPanel);
    }
    
    var dataView = new Application.components.imgGalleryDataView({
      region: 'west',
      title: 'Загруженные изображения',
      id: gallery_id,
      height: 400,
      width: 180,
      style: 'padding: 0px',
      procedure_id: this.procedure_id,
      editable: this.editable
    });
    
    var imageView = new Application.components.imgSingleView({
      id: single_image_id,
      region: 'center',
      height: 400,
      title: 'Просмотр изображения'
    });
    
    items.push(imageView);
    items.push(dataView);
    
    
    
    if(this.editable) {
      this.relayEvents(uploadPanel, ['uploadcomplete']);
      uploadPanel.relayEvents(this, ['idchanged']);
      dataView.relayEvents(uploadPanel, ['uploadcomplete']);
      imageView.relayEvents(dataView, ['itemDeleted']);
    }
    dataView.relayEvents(this, ['itemsLoaded']);
    imageView.relayEvents(dataView, ['itemSelected']);
      
    Ext.apply(this, {
      autoHeight: true,
      frame: true,
      name: 'lot_unit_pictures',
      items: [
        {
          layout: 'border',
          xtype: 'panel',
          height: this.editable? 600 : 430,
          defaults: {
            frame: true,
            split: true
          },
          items: items
        }
      ],
      listeners: {
        idchanged : function(id) {
          this.procedure_id = id;
        },
        uploadcomplete : function(result, action) {
          if (result.success
              && result.procedure_id
              && this.parent
              && result.procedure_id!=this. parent.procedure_id)
          {
            this.parent.fireEvent('idchanged', result.procedure_id);
          }
        }
      }
    });
    if(this.files) {
      this.on('afterrender', function() {
        this.setValues(this.files);
      })
    }
    Application.components.imageGalleryPanel.superclass.initComponent.call(this);
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
    var file=null;
    
    for (var i=0; i<v.length; i++) {
      file = v[i];
      this.fileitems.push(file); 
    }
    this.fireEvent('itemsLoaded', {images:this.fileitems});
  },
  getValues: function() {
    var values = Ext.getCmp(this.filePanelId).getFileItems();
    return values;
  }
});
