declare module '@camunda/linting' {
    export class Linter {
        constructor(options: { modeler: 'web' | 'desktop'; type: 'cloud' | 'platform' });
        lint(input: string): Promise<any[]>;
    }
}

declare module '@camunda/linting/modeler' {
    const lintingModule: any;
    export default lintingModule;
}

declare module '@camunda/linting/assets/linting.css'; 