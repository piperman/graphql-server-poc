import { RESTDataSource } from '@apollo/datasource-rest';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { Order } from '../__generated__/resolvers-types';

export class OrderAPI extends RESTDataSource {
  override baseURL = 'http://localdev.snaples.dev.macrofab.com:5140/';

  //   async getOrder(id): Promise<Order> {
  //     return this.get<Order>(`movies/${encodeURIComponent(id)}`);
  //   }

  constructor(options: { cache: KeyValueCache }) {
    super(options);
  }
  // private userLoader = new DataLoader(async (ids) => {
  //   const userId_list = await resolvers.getUserList(ids);
  //   return ids.map((id) => userId_list.find((user) => user.id === id));
  // });

  async getOrdersList(args: { start_date: any; end_date: any; }): Promise<Order[]> {
    const start_date = args.start_date;
    const end_date = args.end_date;
    let params = '?';
    if (start_date != undefined) {
      const startDate = 'start_date='.concat(start_date.toString());
      params = params.concat(startDate.toString());
    }
    if (end_date != undefined) {
      if (params.length > 3) {
        params = params.concat('&end_date=', end_date.toString());
      } else {
        params = params.concat('end_date=', end_date.toString());
      }
    }
    const data = await this.get(`api/v3/orders/list${params}`);
    return data.orders;
  }
}

// export default OrderAPI