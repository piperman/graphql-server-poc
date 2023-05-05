import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import DataLoader from 'dataloader';
import { IncomingHttpHeaders } from 'http';
import { User } from '../__generated__/resolvers-types';

export class UserAPI extends RESTDataSource {
  override baseURL = 'http://localhost/';
  private apikey: string;
  headers: IncomingHttpHeaders;

  constructor(options: { headers: IncomingHttpHeaders; cache: KeyValueCache }) {
        super(options);
        this.headers = options.headers;
        // this.apikey = options.apikey;
        // console.log("apikey: %s", this.apikey)
  }


  private userLoader = new DataLoader(async (ids:string[]) => {
    const userId_list = await this.getUserList({"user_ids": ids});
    return ids.map((id) => userId_list.find((user) => user.user_id === id));
  });

  // override willSendRequest ( path: string, request: AugmentedRequest ) {
        // request.params.set('apikey', this.apikey);
        // console.log("request params: %s", request.params)
        // console.log("request: %s ", {request})
  // }

  async getUser({id}): Promise<User> {
    return await this.userLoader.load(id);
  }

  async getUserList(user_ids: { user_ids: any; }): Promise<User[]> {
    // const h = this.headers;
    // console.log("Headers apitoken: %s", h['apitoken']);
    let payload = { "user_ids": user_ids.user_ids };
    const data = await this.post(`api/v3/user/search/by_ids`, { body: payload },);
    return Object.values(data.users);
  }

//   async getMostViewedMovies(limit = '10'): Promise<Movie[]> {
//     const data = await this.get('movies', {
//       params: {
//         per_page: limit,
//         order_by: 'most_viewed',
//       },
//     });
//     return data.results;
//   }
}

// export default UserAPI