
Ext.define('Application.components.imgGalleryDataView', {
  extend: 'Ext.Panel',  
  initComponent: function() {
    var component = this;
    var gallery_id = 'image-galery', tbar_id=Ext.id();
    this.addEvents('itemSelected');
    this.addEvents('uploadcomplete');
    this.addEvents('itemsLoaded');
    this.addEvents('itemDeleted');
    
    var items = [];
    
    
    var tpl = new Ext.XTemplate(
	    '<ul>','\
         <tpl for=".">',
	        '<li class="thumb-wrap" id="{id}">',
	        '<strong>{descr}</strong>',
            '<img src="{thumbLink}" width="80" />',
            '<tpl if="values.main_pic"><span style="color: red;font-weight: bold;">основное фото</span></tpl>',
            '</li>',
	    '</tpl>',
	    '</ul>'
	);
      
    if(!this.fileitems) {
      this.fileitems = [];
    }
      
    this.store = new Ext.data.JsonStore({
      autoDestroy: true,
      storeId: 'galeryStore',
      proxy: new Ext.data.MemoryProxy(),
      // reader configs
      idProperty: 'id',
      root: 'images',
      fields: [
        'id', 'name','descr', 'file', 'hash', 'size','type', 
        'link', 'thumbLink', 'previewLink','main_pic'
      ]
    });
    
    var dataview = new Ext.DataView({
      autoScroll: true,
      store: this.store,
      tpl: tpl,
      id: gallery_id,
      height: 370,
      singleSelect: true,
      overClass: 'x-view-over',
      itemSelector: 'li.thumb-wrap',
      style: 'border:1px solid #99BBE8; border-top-width: 0',
      plugins : [],
      listeners: {
        selectionchange: function(dv,nodes){
          var l = nodes.length;
          var s = l != 1 ? 's' : '';
          //component.setTitle(component.getTitle()+'(выбрано '+l+' фото )');

        },
        click: function() {
            var selNode = dataview.getSelectedRecords();
            component.fireEvent('itemSelected', selNode[0].data);
        }
      }
    });
   
    if(this.editable) {
      var tbar = new Ext.Toolbar({
        id: tbar_id,
        style: 'border:1px solid #99BBE8;'
      });
      tbar.add('->', 
      {
        tooltip: 'Сделать основным',
	    icon: 'ico/status4.png',
	    handler: function() {
          var records = dataview.getSelectedRecords();
          if (records.length != 0) {
            var file = {id: records[0].data.id, procedure_id: component.procedure_id};
            performRPCCall(RPC_tsn.Procedure.setmainpic, [file], null, function(result) {
              if(result.success) {
                component.store.loadData(result.files);
              } else {
                echoResponseMessage(result);
              }
            });
          }
        }
      },
      {
	    tooltip: 'Удалить',
	    icon: 'ico/delete.png',
	    handler: function() {
          var records = dataview.getSelectedRecords();
          if (records.length != 0) {
              var file = {id: records[0].data.id, type: records[0].data.type};
              performRPCCall(RPC_tsn.Procedure.removeFile, [file], null, function(result) {
                if(result.success) {
                  component.store.remove(records[0]);
                  component.store.reload();
                  component.fireEvent('itemDeleted', file.id);
                } else {
                  echoResponseMessage(result);
                }
              });
            }
          }
      });
      items.push(tbar);
    }
    
    items.push(dataview);
    
    this.items = items;
    
    this.addListener('uploadcomplete', function(result, action) {
      var item = result.file;
      
      this.addRecord(item);
      if(result.procedure_id && result.procedure_id!=this.procedure_id) {
        this.procedure_id=result.procedure_id;
      }
      //this.store.reload();
      //return this;
    });
    
    this.addListener('itemsLoaded', function(fileitems) {
      this.store.loadData(fileitems);
    });
    
	dataview.addListener('beforerender', function() {
      var animationPlugin = new Ext.ux.DataViewTransition({
          duration  : 550,
          idProperty: 'id'
      });
      dataview.plugins.push(animationPlugin);
    });
    Application.components.imgGalleryDataView.superclass.initComponent.call(this);
  },
  addRecord : function(dataArray) {
    var FileItem = this.store.recordType;
    var record = new FileItem(dataArray);
    this.store.insert(0, record);
    return this;
  },
  getFileItems : function() {
    var fileItems = [];
    this.store.each(function(record) {
     fileItems.push(record.data); 
    })
    return fileItems;
  }
});
