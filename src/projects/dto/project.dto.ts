export class ProjectDto {
    constructor(object: any) {
        this.name = object.name;
        this.introduction = object.introduction;
    }
    readonly name: string;
    readonly introduction: string;
}
