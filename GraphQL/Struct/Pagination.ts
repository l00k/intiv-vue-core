import { AbstractModel, Model, Property, Group } from '@/intiv/core/Domain/Model';


@Model()
export default class Pagination
    extends AbstractModel<Pagination>
{

    @Property()
    @Group([
        'api'
    ])
    public page : number = 1;

    @Property()
    @Group([
        'api'
    ])
    public itemsPerPage : number = 25;

    @Property()
    public itemsPerPageOptions : number[] = [ 25, 50, 100, 200 ];

    @Property()
    public total : number = 0;

}
