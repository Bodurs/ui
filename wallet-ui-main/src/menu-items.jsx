const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'GTFS Editor',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'feeds',
          title: 'Feeds',
          type: 'item',
          icon: 'feeds',
          url: '/feeds',
          needFeed: false
        },
        {
          id: 'fares',
          title: 'Fares',
          type: 'collapse',
          icon: 'fares',
          needFeed: true,
          children: [
            {
              id: 'fare-products',
              title: 'Fare Products',
              type: 'item',
              url: '/fare-products'
            },
            {
              id: 'fare-media',
              title: 'Fare Media',
              type: 'item',
              url: '/fare-media'
            },
            {
              id: 'fare-leg-rules',
              title: 'Fare Leg Rules',
              type: 'item',
              url: '/fare-leg-rules'
            },
            {
              id: 'fare-leg-join-rules',
              title: 'Fare Leg Join Rules',
              type: 'item',
              url: '/fare-leg-join-rules'
            },
            {
              id: 'fare-transfer-rules',
              title: 'Fare Transfer Rules',
              type: 'item',
              url: '/fare-transfer-rules'
            }
          ]
        },
        {
          id: 'wallet',
          title: 'Wallet',
          type: 'item',
          icon: 'pi pi-wallet',
          url: '/wallets',
          needFeed: false
        },
        {
          id: 'logs',
          title: 'Logs',
          type: 'item',
          icon: 'pi pi-history', 
          url: '/logs',
          needFeed: false
        },

        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'pi pi-th-large',
          url:'/dashboard',
          needFeed: false
        }
        
      ]
    }
  ]
};

export default menuItems;
