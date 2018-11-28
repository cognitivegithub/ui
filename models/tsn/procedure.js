
Application.models.Tsn_Procedure = {
  statuses: [
    'Не подписан',
    'Не опубликован',
    'Прием предложений',
    '', // статус 3 не используется
    '', // статус 4 не используется
    '', // статус 5 не используется
    'Подведение итогов',
    'Заключение договора',
    'Архив',
    'Приостановлен',
    'Отменен'
  ],
  
  type_ids: {
    auction: 1,
    fix_price: 2,
    // и наоборот
    '1': 'auction',
    '2': 'fix_price'
  },
  types: [
    {
      id: 1,
      name: 'Торги на повышение',
      statuses: [0,1,2,6,7,8,9,10],
      hidden: false
    },
    {
      id: 2,
      name: 'Фиксированная цена',
      statuses: [0,1,2,7,8,9,10],
      hidden: false
    }
  ],
  typesStore: null,
  statusStore : null,
  serverTypeStore: null,
  getTypesStore: function() {
    
    this.typesStore = new Ext.data.ArrayStore({
      id: 0,
      data: [[1, 'Торги на повышение'], [2, 'Фиксированная цена']],
      fields: ['id', 'name']
    });
    
    return this.typesStore
  },
  getStatusStore : function(typeId) {
    var curType = this.getType(typeId);
    var statuses = [];
    for(var i=0; i<curType.statuses.length; i++) {
      if(curType.statuses[i]>=2) {
        statuses.push([curType.statuses[i], this.statuses[curType.statuses[i]]]);
      }
    }

    this.statusStore = new Ext.data.ArrayStore({
        id: 0,
        autoload: false,
        fields: [
            'id',
            'name'
        ],
        data: statuses
    });
    return this.statusStore
  },
  getType: function(id) {
    for (var i=0; i<this.types.length; i++) {
      if (this.types[i].id == id) {
        return this.types[i];
      }
    }
    return null;
  }
}
