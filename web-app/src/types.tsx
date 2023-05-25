export interface Event {
	id: string;
	subject: string;
	start: End;
	end: End;
	location: Location;
	attendees: Attendee[];
	organizer: Organizer;
}

export interface Attendee {
	type: string;
	status: Status;
	emailAddress: EmailAddress;
}

export interface EmailAddress {
	name: string;
	address: string;
}

export interface Status {
	response: string;
	time: Date;
}

export interface End {
	dateTime: Date;
	timeZone: string;
}

export interface Location {
	displayName: string;
	locationUri: string;
	locationType: string;
	uniqueId: string;
	uniqueIdType: string;
}

export interface Organizer {
	emailAddress: EmailAddress;
}
