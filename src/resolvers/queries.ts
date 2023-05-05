import { QueryResolvers } from '../__generated__/resolvers-types';

// Use the generated `QueryResolvers`
// type to type check our queries!
const queries: QueryResolvers = {
    Query: {
        ordersList: async (_, args, contextValue, info) => {
            console.log("Info from OrdersList: ", info.fieldNodes[0].selectionSet.selections);
            return await contextValue.dataSources.orderAPI.getOrdersList(args);
        },
        user: async (_, user_id, contextValue) => {
            let id = user_id.user_id
            return await contextValue.dataSources.userAPI.getUser({ id });
        },
        userList: async(_, { user_ids }, contextValue) => {
            return contextValue.dataSources.userAPI.getUserList({user_ids});
        }
    },
    Order: {
        user: async (parent:  any, args: any, contextValue: any) => {
            const id = parent.user_id;
            return await contextValue.dataSources.userAPI.getUser({ id });
        }
    }
};

export default queries;