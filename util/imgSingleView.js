
Ext.define('Application.components.imgSingleView', {
  extend: 'Ext.Panel',
  initComponent: function() {
   
    var img_panel_id = Ext.id();
    this.addEvents('itemSelected');
    
    
    var tplDetail = new Ext.XTemplate(
	    '<div class="details">',
	        '<tpl for=".">',
                '<div class="details-info">',
	            '<h4>{descr}</h4>',
                '<img src="{previewLink}" height="320"><br>',
                '<span><a href="{link}" target="_blank">Просмотреть полноразмерное изображение</a></span>',
	            '</div>',
	        '</tpl>',
	    '</div>'
	);
    
    this.file_id = null;
    
    Ext.apply (this, {
      html: '',
      autoScroll: true,
      id: img_panel_id
    });
    
    this.addListener('itemSelected' , function(item) {
      this.file_id = item.id;
      var html=tplDetail.apply(item);
      this.update(html);
    });
    
    this.addListener('itemDeleted', function(itemId) {
      if(this.file_id==itemId) {
       this.update(null); 
      }
    });    
	
    Application.components.imgSingleView.superclass.initComponent.call(this);
  }
});
