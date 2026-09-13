import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : trim({ value });

export class LoginBody {
  @Transform(trim)
  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  password!: string;
}

export class RegisterPatientBody extends LoginBody {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @Transform(trim)
  @IsUUID('4')
  structureId!: string;

  @Transform(trim)
  @Matches(/^[A-Za-z0-9]{16}$/)
  fiscalCode!: string;

  @Transform(trim)
  @IsISO8601({ strict: true })
  birthDate!: string;
}

export class ChangePasswordBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  newPassword!: string;
}

export class BookAppointmentBody {
  @Transform(trim)
  @IsUUID('4')
  doctorId!: string;

  @Transform(trim)
  @IsISO8601({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  startTime!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class ClinicalAccessBody {
  @IsDefined()
  @IsBoolean()
  granted!: boolean;
}

export class CreateReviewBody {
  @Transform(trim)
  @IsUUID('4')
  appointmentId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

export class CreateReportBody {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  diagnosis!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  prescriptions?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  notes?: string;
}

export class UpdateReportBody {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  diagnosis?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  prescriptions?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  notes?: string;
}

export class ResourceStatusBody {
  @IsDefined()
  @IsBoolean()
  isActive!: boolean;
}

export class CreateStructureBody {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}

export class UpdateStructureBody {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}

export class CreateSpecializationBody {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Transform(trim)
  @IsUUID('4')
  structureId!: string;
}

export class UpdateSpecializationBody {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4')
  structureId?: string;
}

export class CreateDoctorBody {
  @Transform(trim)
  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @Transform(trim)
  @IsUUID('4')
  structureId!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4')
  specializationId?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string;
}

export class UpdateDoctorBody {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4')
  structureId?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4')
  specializationId?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string;
}
