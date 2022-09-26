export default interface IViewManager {
  getView(viewPath: string): Promise<string>;
}
