import { CodeBlockWriter } from "./codeBlockWriter";
import { StructurePrinterFactory } from './factories';

export type Constructor<T> = new(...args: any[]) => T;
export type WriterFunction = (writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory) => void;
