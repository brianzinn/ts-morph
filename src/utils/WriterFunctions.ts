import { CodeBlockWriter } from "../codeBlockWriter";
import { TypeElementMemberedNodeStructure } from "../structures";
import { StructurePrinterFactory } from "../factories";
import { WriterFunction } from "../types";

export type WriterFunctionOrValue = string | number | WriterFunction;

/**
 * Writer functions. Retrieve these from Project#getWriterFunctions().
 */
export interface WriterFunctions {
    /**
     * Gets a writer function for writing the provided object as an object literal expression.
     * @param obj - Object to write.
     */
    object(obj: { [key: string]: WriterFunctionOrValue | undefined; }): WriterFunction;
    /** Gets a writer function for writing an object type. */
    objectType(structure: TypeElementMemberedNodeStructure): WriterFunction;
    /** Gets a writer function for writing a union type. */
    unionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]): WriterFunction;
    /** Gets a writer function for writing an intersection type. */
    intersectionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]): WriterFunction;
}

/** @deprecated Deprecated writer functions. Use Project#getWriterFunctions() instead. */
export const WriterFunctions = {
    object: object as (obj: { [key: string]: WriterFunctionOrValue | undefined; }) => WriterFunction
};

export function getWriterFunctions(): WriterFunctions {
    return {
        object,
        objectType,
        unionType,
        intersectionType
    };

    function objectType(structure: TypeElementMemberedNodeStructure): WriterFunction {
        return (writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory) => {
            writer.write("{");
            if (anyPropertyHasValue(structure)) {
                writer.indentBlock(() => {
                    structurePrinterFactory.forTypeElementMemberedNode().printText(writer, structure);
                });
            }
            writer.write("}");
        };
    }

    function unionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]) {
        const allTypes = [firstType, secondType, ...additionalTypes];
        return (writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory) => {
            writeSeparatedByString(writer, structurePrinterFactory, " | ", allTypes);
        };
    }

    function intersectionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]) {
        const allTypes = [firstType, secondType, ...additionalTypes];
        return (writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory) => {
            writeSeparatedByString(writer, structurePrinterFactory, " & ", allTypes);
        };
    }
}

function object(obj: { [key: string]: WriterFunctionOrValue | undefined; }): WriterFunction {
    return (writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory) => {
        const keyNames = Object.keys(obj);
        writer.write("{");
        if (keyNames.length > 0) {
            writer.indentBlock(() => {
                writeObject();
            });
        }
        writer.write("}");

        function writeObject() {
            for (let i = 0; i < keyNames.length; i++) {
                if (i > 0)
                    writer.write(",").newLine();

                const keyName = keyNames[i];
                const value = obj[keyName];
                writer.write(keyName);
                if (value != null) {
                    writer.write(": ");
                    writeValue(writer, structurePrinterFactory, value);
                }
            }

            writer.newLine();
        }
    };
}

function anyPropertyHasValue(obj: any) {
    for (const key of Object.keys(obj)) {
        if (obj[key] == null)
            continue;
        if (obj[key] instanceof Array && obj[key].length === 0)
            continue;

        return true;
    }

    return false;
}

function writeSeparatedByString(writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory, separator: string, values: WriterFunctionOrValue[]) {
    for (let i = 0; i < values.length; i++) {
        writer.conditionalWrite(i > 0, separator);
        writeValue(writer, structurePrinterFactory, values[i]);
    }
}

function writeValue(writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory, value: WriterFunctionOrValue) {
    if (value instanceof Function)
        value(writer, structurePrinterFactory);
    else
        writer.write(value.toString());
}
